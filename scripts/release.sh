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
#           Le reste (scp du site, /tmp) se fait avec l'utilisateur SSH normal.
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
build_note() {
  local last_tag range
  last_tag="$(git describe --tags --match 'apk-v*' --abbrev=0 2>/dev/null || true)"
  range="${last_tag:+$last_tag..}HEAD"; [[ -n "$last_tag" ]] || range="HEAD~30..HEAD"
  git log "$range" --format='%s' 2>/dev/null \
    | grep -E '^(feat|fix)(\(|!|:)' \
    | sed -E 's/^(feat|fix)(\([^)]*\))?!?:[[:space:]]*/• /' \
    | head -8
}

# ── OTA ──────────────────────────────────────────────────────────────────────
release_ota() {
  local cur next zip url
  cur="$(curl -s -X POST "$API/app/updates" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("version",""))' 2>/dev/null || true)"
  [[ -n "$cur" ]] || cur="$(vps "grep -oP '(?<=^APP_OTA_VERSION=).*' $BACKEND_DIR/.env" 2>/dev/null || echo '1.0.0')"
  next="$(bump_patch "$cur")"
  zip="ota-${next}.zip"
  url="https://gextimoapi.novafriq.africa/app-bundles/$zip"   # servi par nginx

  say "OTA $cur → $next"
  npm run build
  ( cd dist && zip -qr "../$zip" . )
  scp -q "$zip" "$VPS:/tmp/$zip"
  rm -f "$zip"
  deploy ota "$next" "$zip"
  ok "OTA $next en ligne : $url"

  # Prévenir les professionnels. Sans ça, une version publiée n'était visible
  # que dans « Quoi de neuf » — un écran qu'il faut penser à ouvrir : personne
  # n'était donc AVERTI. La commande dépose la notification dans l'application
  # et envoie la notification système aux appareils enregistrés.
  # Un échec ici ne doit jamais faire échouer une publication déjà en ligne.
  # Le sujet du dernier commit sert d'intitulé au journal « Quoi de neuf » :
  # sans lui, l'écran des nouveautés restait figé sur d'anciennes versions.
  local sujet
  sujet="$(git log -1 --pretty=%s | sed "s/'/’/g" | cut -c1-110)"
  if ssh "$VPS" "cd /var/www/gextimo_backend && php artisan app:notifier-maj '$next' --titre='$sujet'" >/dev/null 2>&1; then
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
  local sujet_apk
  sujet_apk="$(git log -1 --pretty=%s | sed "s/'/’/g" | cut -c1-110)"
  if ssh "$VPS" "cd /var/www/gextimo_backend && php artisan app:notifier-maj '$next_vn' --majeure --titre='$sujet_apk'" >/dev/null 2>&1; then
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
