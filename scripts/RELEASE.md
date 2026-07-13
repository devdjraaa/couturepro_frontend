# Release Gextimo — automatique au `git push`

Sur la branche **`android`**, chaque `git push origin android` déclenche
automatiquement la bonne release (hook `pre-push` → `scripts/release.sh`).
Tu n'as **rien à faire d'autre que commit + push**.

## Ce qui se passe selon ce que tu modifies

| Tu modifies… | Release |
|---|---|
| `src/**`, `public/**`, `index.html`, i18n (web) | **OTA à chaud** (silencieux, appliqué à l'ouverture) |
| `android/**`, `capacitor.config.json`, un plugin `@capacitor`/`@capgo` | **APK** (grosse MAJ : popup + notif + version-gate) |
| tooling/docs seulement (`scripts/`, `.md`, `.gitignore`) | rien |

## Forcer / bloquer via le message de commit

- `[apk]` → force une **APK** (ex. gros changement de parcours, très visible).
- `[ota]` → force une **OTA**.
- `[skip-release]` → ne déclenche **aucune** release.

## Règles importantes

- **Ne bumpe JAMAIS `versionName`/`versionCode` toi-même** dans
  `android/app/build.gradle` : le script s'en charge (sinon un numéro est sauté).
- Après une **APK**, le script crée un commit `chore(release): apk vX
  [skip-release]` + un tag `apk-vX`. Ils partent à ton **prochain push** — c'est
  normal, laisse-les.
- **Nouveaux utilisateurs** : chaque APK écrase `Gextimo-v1.0.apk` sur la vitrine
  (lien stable du bouton de téléchargement) → le site sert **toujours la dernière
  version**. Rien à faire.
- Le **changelog** du popup est généré tout seul depuis tes commits `feat:`/`fix:`
  depuis la dernière APK. Écris donc des messages de commit propres.

## Mise en place (une seule fois par clone)

```bash
./scripts/install-hooks.sh      # installe le hook pre-push
```

Le déploiement VPS ne demande **aucun mot de passe** (script root
`/usr/local/sbin/gextimo-deploy` autorisé en NOPASSWD, cf. `/etc/sudoers.d/`).

## Si une release échoue (VPS injoignable…)

Le push n'est **pas** bloqué. Relance simplement à la main quand c'est réglé :

```bash
./scripts/release.sh
```

## Version-gate : MAJ optionnelle vs obligatoire

Par défaut chaque APK est une MAJ **optionnelle** (popup avec « Plus tard »).
Pour rendre une MAJ **obligatoire** (bloquante), monte `APP_MIN_VERSION` dans le
`.env` du backend à la version voulue (à la main, cas rare).
