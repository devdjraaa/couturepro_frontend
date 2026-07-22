#!/usr/bin/env bash
#
# scripts/release.sh — Release automatique Gextimo (OTA à chaud OU nouvelle APK).
#
# Appelé par le hook pre-push (voir scripts/git-hooks/pre-push) au push de la
# branche `android`. Peut aussi être lancé à la main : ./scripts/release.sh
#
# LOGIQUE
#   1. Décide le type de release d'après les fichiers modifiés + tags de commit :
#        - APK (grosse MAJ)  si le diff touche du natif :
#              android/**, capacitor.config.json, ou un plugin @capacitor|@capgo
#              ajouté/retiré/changé dans package.json ; OU tag [apk] dans un commit.
#        - OTA (à chaud)     sinon (web pur : src/**, index.html, public/**, i18n).
#        - SKIP              si tag [skip-release] (ou aucun changement pertinent).
#        - Override : [ota] force une OTA, [apk] force une APK.
#   2. Calcule le prochain numéro de version (tu ne le gères pas).
#   3. Build + déploie sur le VPS + met à jour l'OTA ou le version-gate.
#   4. APK : crée un commit chore(release) avec le bump (part à ton prochain push)
#           et un tag apk-vX. OTA : aucune écriture git (la version vit sur le VPS).
#
# PRIVILÈGES : aucune saisie de mot de passe. Le seul point root (déplacer le
#           bundle, éditer le .env backend, config:cache, reload php-fpm) passe
#           par le script root du VPS /usr/local/sbin/gextimo-deploy, autorisé
#           sans mot de passe via /etc/sudoers.d/gextimo-deploy (NOPASSWD).
#           Le reste (scp du site, /tmp, artisan) se fait avec l'utilisateur SSH
#           normal — enregistrer une empreinte ou notifier ne demande pas root.
#
# NOTIFICATIONS — convention « Notification-Titre » / « Notification-Ligne » :
#           un pied de commit peut porter le texte à montrer aux professionnels,
#           par exemple :
#               Notification-Titre: Vos réalisations sont accessibles partout
#               Notification-Ligne: Le lien manquait dans le menu ; c'est réparé.
#               Notification-Ligne: Vos brouillons restent lisibles sans réseau.
#           Sans ce pied, AUCUN texte de secours n'est fabriqué à partir du sujet
#           du commit (git log brut) — c'est justement ce qui donnait des titres
#           de notification illisibles du type « fix(réalisations): … ». Sans
#           trailer, `app:notifier-maj` retombe sur son propre défaut neutre
#           (« Améliorations et corrections »), jamais sur un message technique.
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"

# ── Config ──────────────────────────────────────────────────────────────────
VPS="${GEXTIMO_VPS:-novafriq}"
BRANCH="android"
BACKEND_DIR="/var/www/gextimo_backend"
SITE_DIR="/var/www/gextimo_frontend"
BUNDLES_DIR="/var/www/app-bundles"
API="https://gextimoapi.novafriq.africa/api"
SITE_URL="https://gextimo.novafriq.africa"
GRADLE="android/app/build.gradle"

# Identifiant de paquet lu dans la config plutôt qu'écrit en dur : le jour où
# ce script sert aussi la console admin (com.couturepro.admin), il n'y a rien
# à changer ici.
APP_ID="$(python3 -c "import json;print(json.load(open('capacitor.config.json'))['appId'])" 2>/dev/null || echo com.couturepro.app)"

# Optionnel : overrides locaux non versionnés (ex. GEXTIMO_VPS=autrehôte).
[[ -f "$ROOT/scripts/.deploy.env" ]] && source "$ROOT/scripts/.deploy.env"

say()  { printf '\033[1;36m▶ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m⚠ %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# Exécute une commande NON-sudo sur le VPS (l'utilisateur possède site + /tmp).
vps() { ssh "$VPS" "$1"; }
# Lance le script root de déploiement, sans mot de passe (NOPASSWD, cf.
# /etc/sudoers.d/gextimo-deploy). C'est le SEUL point qui a besoin de root.
deploy() { ssh "$VPS" "sudo -n /usr/local/sbin/gextimo-deploy $*"; }

# Incrémente le dernier segment : 1.0.4 -> 1.0.5, 1.0.11 -> 1.0.12
bump_patch() { local v="$1"; echo "${v%.*}.$(( ${v##*.} + 1 ))"; }

# Échappe une apostrophe pour un argument shell simple-quoté, sans casser la
# citation ('#39; devient '’' plutôt que de fermer/rouvrir des guillemets) —
# même convention que le reste du script.
esc() { printf '%s' "$1" | sed "s/'/’/g"; }

# ── 0. On ne release que la branche android ─────────────────────────────────
cur_branch="$(git rev-parse --abbrev-ref HEAD)"
[[ "$cur_branch" == "$BRANCH" ]] || { warn "Branche $cur_branch ≠ $BRANCH — release ignorée."; exit 0; }

# ── 1. Plage de commits poussés + classification ────────────────────────────
# Le hook fournit le SHA distant ; sinon on prend origin/android..HEAD.
REMOTE_SHA="${GEXTIMO_PUSH_REMOTE_SHA:-}"
if [[ -n "$REMOTE_SHA" && "$REMOTE_SHA" =~ ^0+$ ]]; then
  RANGE="HEAD~20..HEAD"                       # nouvelle branche : derniers commits
elif [[ -n "$REMOTE_SHA" ]]; then
  RANGE="$REMOTE_SHA..HEAD"
elif git rev-parse --verify -q "origin/$BRANCH" >/dev/null; then
  RANGE="origin/$BRANCH..HEAD"
else
  RANGE="HEAD~20..HEAD"
fi

CHANGED="$(git diff --name-only $RANGE 2>/dev/null || true)"
MSGS="$(git log $RANGE --format='%B' 2>/dev/null || true)"
[[ -n "$CHANGED" ]] || { warn "Aucun changement dans $RANGE — rien à release."; exit 0; }

echo "$MSGS" | grep -q '\[skip-release\]' && { say "Tag [skip-release] → release ignorée."; exit 0; }
FORCE_APK=0; echo "$MSGS" | grep -q '\[apk\]' && FORCE_APK=1
FORCE_OTA=0; echo "$MSGS" | grep -q '\[ota\]' && FORCE_OTA=1

NATIVE=0
echo "$CHANGED" | grep -qE '^(android/|capacitor\.config\.json)' && NATIVE=1
if echo "$CHANGED" | grep -q '^package\.json$'; then
  git diff $RANGE -- package.json | grep -qE '^[+-].*"@(capacitor|capgo)/' && NATIVE=1
fi
# Changement web réellement livrable (sinon commit purement tooling/docs → on ne livre rien).
WEB=0
echo "$CHANGED" | grep -qE '^(src/|public/|index\.html$)' && WEB=1

if   [[ $FORCE_OTA == 1 ]]; then TYPE=ota
elif [[ $FORCE_APK == 1 || $NATIVE == 1 ]]; then TYPE=apk
elif [[ $WEB == 1 ]]; then TYPE=ota
else say "Changements tooling/docs seulement → rien à déployer."; exit 0; fi

say "Release: TYPE=$TYPE (natif=$NATIVE force_apk=$FORCE_APK force_ota=$FORCE_OTA)"

# ── 2. Génère la note de changelog (depuis le dernier tag apk-v*) ────────────
# Alimente le version-gate natif (popup de grosse MAJ) — mécanisme séparé et
# déjà propre : il ne recopie jamais un sujet de commit brut, seulement les
# commits `feat`/`fix` nettoyés de leur préfixe.
build_note() {
  local last_tag range
  last_tag="$(git describe --tags --match 'apk-v*' --abbrev=0 2>/dev/null || true)"
  range="${last_tag:+$last_tag..}HEAD"; [[ -n "$last_tag" ]] || range="HEAD~30..HEAD"

  # `mapfile` lit le pipe JUSQU'AU BOUT avant de trancher aux 8 premières
  # lignes. La version précédente terminait sur `| head -8` : dès que la
  # plage contenait plus de 8 commits feat/fix (arrivé aujourd'hui, avec le
  # volume de commits de la journée), `head` lisait ses 8 lignes puis fermait
  # le pipe — `git log`/`grep`/`sed` recevaient SIGPIPE, `pipefail` propageait
  # leur code 141, et `set -e` arrêtait NET la release en plein milieu, sans
  # message, juste après le build APK. C'est exactement ce qui s'est produit
  # en poussant ce commit : la release s'est interrompue après « APK généré »,
  # sans rien publier ni notifier personne. Trancher APRÈS avoir tout lu
  # rend la fermeture anticipée du pipe impossible.
  local -a lignes
  mapfile -t lignes < <(git log "$range" --format='%s' 2>/dev/null \
    | grep -E '^(feat|fix)(\(|!|:)' \
    | sed -E 's/^(feat|fix)(\([^)]*\))?!?:[[:space:]]*/• /')
  (( ${#lignes[@]} )) && printf '%s\n' "${lignes[@]:0:8}"
}

# Construit les arguments --titre/--ligne de `app:notifier-maj` à partir des
# trailers « Notification-Titre » / « Notification-Ligne » posés sur les
# commits de la plage poussée $RANGE (voir convention en tête de fichier).
#
# AUCUN repli sur le sujet brut d'un commit : c'est précisément ce qui, ajouté
# dans une session précédente, avait cassé la lisibilité des notifications
# (« fix(réalisations): page importée mais jamais routée sur mobile » montré
# tel quel à un professionnel). Sans trailer, on ne passe RIEN, et
# `app:notifier-maj` retombe sur son propre défaut neutre.
notif_args() {
  local titre lignes=() ligne args=()

  # Le plus récent d'abord (git log liste du plus récent au plus ancien) :
  # `grep -m1` prend donc le titre du commit le plus proche de HEAD.
  titre="$(git log $RANGE --format='%B' 2>/dev/null \
    | grep -m1 '^Notification-Titre:' \
    | sed -E 's/^Notification-Titre:[[:space:]]*//')"
  [[ -n "$titre" ]] && args+=(--titre="$(esc "$titre")")

  while IFS= read -r ligne; do
    [[ -n "$ligne" ]] || continue
    args+=(--ligne="$(esc "$ligne")")
  done < <(git log $RANGE --format='%B' 2>/dev/null \
    | grep '^Notification-Ligne:' \
    | sed -E 's/^Notification-Ligne:[[:space:]]*//')

  # Garde impérative : avec un tableau VIDE, `printf '%s\n' "${args[@]}"`
  # traite quand même son format une fois et imprime une ligne vide — cette
  # ligne vide serait ensuite lue comme UN argument fantôme par `mapfile`, et
  # transmise à `app:notifier-maj` comme un argument positionnel inattendu :
  # Symfony Console la rejette, et la commande échoue en silence (branche
  # « non partie ») précisément dans le cas qu'on veut couvrir — l'absence de
  # trailer. Testé en isolation avant de le corriger.
  (( ${#args[@]} )) && printf '%s\n' "${args[@]}"
}

# ── OTA ──────────────────────────────────────────────────────────────────────
release_ota() {
  local cur next zip url sha256 sha_servi

  cur="$(curl -s -X POST "$API/app/updates" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("version",""))' 2>/dev/null || true)"
  [[ -n "$cur" ]] || cur="$(vps "grep -oP '(?<=^APP_OTA_VERSION=).*' $BACKEND_DIR/.env" 2>/dev/null || echo '1.0.0')"
  next="$(bump_patch "$cur")"
  zip="ota-${next}.zip"
  url="https://gextimoapi.novafriq.africa/app-bundles/$zip"   # servi par nginx

  say "OTA $cur → $next"
  npm run build

  # L'APK est EXCLU du paquet OTA. Il est copié dans dist/ parce qu'il vit dans
  # public/ et que le site web le propose au téléchargement — mais dans une mise
  # à jour à chaud il ne sert à rien, et il en représentait 74 % : 14,16 Mo sur
  # 14,6. Un paquet de cette taille met plusieurs minutes sur une connexion
  # mobile, et Capgo supprime le téléchargement partiel dès que l'application se
  # ferme (autoDeleteFailed) : tout repart de zéro à chaque fois, et la mise à
  # jour n'arrive jamais. Constaté sur appareil le 22/07 — la 1.0.143 a échoué
  # six fois avant d'aboutir en laissant l'application ouverte trois minutes.
  # Le site continue de servir l'APK : seul le paquet OTA s'allège.
  ( cd dist && zip -qr "../$zip" . -x '*.apk' )

  # Intégrité du paquet, en TROIS temps indépendants — aucun ne remplace les
  # autres, chacun attrape une panne que les deux autres laisseraient passer :
  #   1. le zip lui-même est lisible avant même de l'envoyer ;
  unzip -tq "$zip" >/dev/null || die "Paquet OTA corrompu à la création (zip -t a échoué) — rien n'est publié."

  sha256="$(sha256sum "$zip" | cut -d' ' -f1)"
  scp -q "$zip" "$VPS:/tmp/$zip"
  rm -f "$zip"
  deploy ota "$next" "$zip"

  #   2. ce qui est SERVI par nginx est bien ce qu'on vient d'envoyer — une
  #      écriture interrompue côté serveur (disque plein, coupure au mauvais
  #      moment) donnerait sinon un fichier différent de celui vérifié en 1,
  #      installé sans que rien ne s'en aperçoive ;
  sha_servi="$(curl -fsSL -m 90 "$url" | sha256sum | cut -d' ' -f1 || true)"
  [[ "$sha_servi" == "$sha256" ]] \
    || die "Empreinte du paquet servi différente de celle envoyée — publication interrompue, AUCUNE notification partie. Rejouer la release."
  ok "Intégrité du paquet vérifiée (${sha256:0:12}…)"

  #   3. l'APPAREIL vérifiera lui-même l'empreinte avant d'installer — Capgo
  #      lit le champ `checksum` de la réponse `/app/updates` (voir
  #      AppVersionController). Un échec ici ne bloque pas la publication :
  #      c'est un filet de plus, pas une condition pour publier — le paquet
  #      reste installable même sans lui, seulement moins vérifié à l'arrivée.
  if ssh "$VPS" "cd $BACKEND_DIR && php artisan app:enregistrer-checksum-ota '$APP_ID' '$next' '$sha256'" >/dev/null 2>&1; then
    ok "Empreinte enregistrée pour vérification côté appareil"
  else
    warn "Empreinte non enregistrée (le paquet reste installable, sans ce filet côté appareil)"
  fi

  ok "OTA $next en ligne : $url"

  # Prévenir les professionnels. Sans ça, une version publiée n'était visible
  # que dans « Quoi de neuf » — un écran qu'il faut penser à ouvrir : personne
  # n'était donc AVERTI. La commande dépose la notification dans l'application
  # et envoie la notification système aux appareils enregistrés.
  # Un échec ici ne doit jamais faire échouer une publication déjà en ligne.
  local args=()
  mapfile -t args < <(notif_args)
  if ssh "$VPS" "cd $BACKEND_DIR && php artisan app:notifier-maj '$next' ${args[@]@Q}" >/dev/null 2>&1; then
    ok "Professionnels prévenus de la version $next"
  else
    say "Publication OK, mais la notification n'est pas partie (à relancer à la main)"
  fi
}

# ── APK ──────────────────────────────────────────────────────────────────────
release_apk() {
  local cur_vn cur_vc next_vn next_vc apk site_apk url note note_b64
  cur_vn="$(grep -oP '(?<=versionName ")[^"]+' $GRADLE)"
  cur_vc="$(grep -oP '(?<=versionCode )\d+' $GRADLE)"
  next_vn="$(bump_patch "$cur_vn")"
  next_vc="$(( cur_vc + 1 ))"
  apk="android/app/build/outputs/apk/gextimo/debug/app-gextimo-debug.apk"
  site_apk="Gextimo-v${next_vn}.apk"
  url="$SITE_URL/$site_apk"

  say "APK $cur_vn (code $cur_vc) → $next_vn (code $next_vc)"
  # Bump versionName/versionCode AVANT le build (l'APK doit embarquer le bon numéro)
  sed -i "s/versionCode $cur_vc/versionCode $next_vc/; s/versionName \"$cur_vn\"/versionName \"$next_vn\"/" $GRADLE

  ./scripts/build-android.sh user
  [[ -f "$apk" ]] || die "APK introuvable après build : $apk"

  scp -q "$apk" "$VPS:$SITE_DIR/$site_apk"
  # Le site pointe vers /Gextimo.apk — c'est CE nom qu'il faut rafraîchir.
  # Il ne l'était pas : le script ne mettait à jour que « Gextimo-v1.0.apk »,
  # si bien que le bouton de téléchargement de la vitrine servait encore, le
  # 20/07, un APK du 16 juillet. Les deux noms sont désormais publiés — l'ancien
  # est conservé parce que des liens et des QR codes le référencent peut-être.
  vps "cp $SITE_DIR/$site_apk $SITE_DIR/Gextimo.apk"
  vps "cp $SITE_DIR/$site_apk $SITE_DIR/Gextimo-v1.0.apk"

  note="$(build_note)"; [[ -n "$note" ]] || note="• Améliorations et corrections diverses"
  note_b64="$(printf '%s' "$note" | sed ':a;N;$!ba;s/\n/\\n/g' | base64 -w0)"

  deploy apk "$next_vn" "$site_apk" "$note_b64"
  ok "APK $next_vn déployée + version-gate à jour : $url"

  # Grosse mise à jour : elle demande une INSTALLATION, il faut donc d'autant
  # plus prévenir — le version-gate seul n'alerte qu'à la prochaine ouverture.
  local args=()
  mapfile -t args < <(notif_args)
  if ssh "$VPS" "cd $BACKEND_DIR && php artisan app:notifier-maj '$next_vn' --majeure ${args[@]@Q}" >/dev/null 2>&1; then
    ok "Professionnels prévenus de la version $next_vn"
  else
    say "Publication OK, mais la notification n'est pas partie (à relancer à la main)"
  fi

  # Commit du bump (+ artefacts icônes régénérés) — part au prochain push. [skip-release]
  # add -u : uniquement les fichiers DÉJÀ suivis (pas les artefacts de build dist/, apk/).
  git add -u
  git commit -q -m "chore(release): apk v$next_vn [skip-release]" || warn "Rien à committer pour le bump."
  git tag "apk-v$next_vn" 2>/dev/null || true
  ok "Commit chore(release) apk v$next_vn + tag apk-v$next_vn créés (iront à ton prochain push)."
}

# ── 3. Exécution ─────────────────────────────────────────────────────────────
case "$TYPE" in
  ota) release_ota ;;
  apk) release_apk ;;
esac
ok "Release terminée."
