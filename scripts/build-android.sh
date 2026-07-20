#!/usr/bin/env bash
set -euo pipefail

# Usage : ./scripts/build-android.sh [user|admin]   (défaut: user)
TARGET="${1:-user}"

if [[ "$TARGET" != "user" && "$TARGET" != "admin" ]]; then
  echo "❌ Cible invalide : $TARGET (attendu: user ou admin)"
  exit 1
fi

if [[ "$TARGET" == "admin" ]]; then
  APP_ID="com.couturepro.admin"
  APP_NAME="Gextimo Admin"
else
  APP_ID="com.couturepro.app"
  APP_NAME="Gextimo"
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "🔧 Build $TARGET (appId=$APP_ID)"

# 1) Backup des fichiers que ce script mute le temps du build.
# build.gradle en fait partie : sans cette sauvegarde, chaque build laissait le
# dépôt marqué par la dernière saveur construite, et le commit suivant figeait
# ces valeurs pour tout le monde.
cp capacitor.config.json capacitor.config.json.bak
cp android/app/build.gradle android/app/build.gradle.bak

# 2) Patcher capacitor.config.json
node -e "
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
cfg.appId   = '$APP_ID';
cfg.appName = '$APP_NAME';
fs.writeFileSync('capacitor.config.json', JSON.stringify(cfg, null, 2) + '\n');
"

# 3) Build Vite avec VITE_APP_TARGET
VITE_APP_TARGET="$TARGET" npm run build

# 4) Sync Capacitor
npx cap sync android

# 4b) Patcher applicationId dans build.gradle (le namespace Java reste fixe).
# ANCRÉ SUR LA PREMIÈRE OCCURRENCE (celle de defaultConfig) : sans le `0,/…/`,
# sed remplaçait aussi les identifiants des deux product flavors, leur donnant
# le même — installer la console admin remplaçait alors l'app des pros au lieu
# de cohabiter avec elle. Les saveurs restent maîtresses de leur identifiant.
sed -i "0,/applicationId \"[^\"]*\"/s//applicationId \"$APP_ID\"/" android/app/build.gradle

# 4c) Patcher le label affiché sur l'écran d'accueil
sed -i "s|<string name=\"app_name\">[^<]*</string>|<string name=\"app_name\">$APP_NAME</string>|" android/app/src/main/res/values/strings.xml
sed -i "s|<string name=\"title_activity_main\">[^<]*</string>|<string name=\"title_activity_main\">$APP_NAME</string>|" android/app/src/main/res/values/strings.xml

# 4d) Copier les icônes du target dans les dossiers mipmap
ICON_DIR="assets/icons/$TARGET"
if [[ -d "$ICON_DIR" ]]; then
  for density in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
    src="$ICON_DIR/mipmap-$density"
    dst="android/app/src/main/res/mipmap-$density"
    if [[ -d "$src" && -d "$dst" ]]; then
      cp "$src/ic_launcher.png"            "$dst/ic_launcher.png"
      cp "$src/ic_launcher_round.png"      "$dst/ic_launcher_round.png"
      cp "$src/ic_launcher_foreground.png" "$dst/ic_launcher_foreground.png"
    fi
  done
  echo "🎨 Icônes $TARGET copiées dans les mipmaps"
fi

# 4e) Patcher la couleur de fond de l'adaptive icon
if [[ "$TARGET" == "admin" ]]; then
  BG_COLOR="#991B1B"
else
  BG_COLOR="#FFFFFF"
fi
sed -i "s|<color name=\"ic_launcher_background\">[^<]*</color>|<color name=\"ic_launcher_background\">$BG_COLOR</color>|" android/app/src/main/res/values/ic_launcher_background.xml

# 5) Build l'APK — RELEASE (signée) si keystore.properties présent, sinon debug.
FLAVOR_CAP="$( [ "$TARGET" = admin ] && echo Admin || echo Gextimo )"
if [ -f android/keystore.properties ]; then
  BUILD_TASK="assemble${FLAVOR_CAP}Release"; BUILD_KIND="release"
else
  BUILD_TASK="assemble${FLAVOR_CAP}Debug";   BUILD_KIND="debug"
fi
echo "🏗️  Tâche Gradle : $BUILD_TASK"
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
  ANDROID_HOME=/home/kaido/Android/Sdk \
  ./android/gradlew -p android "$BUILD_TASK"

# 6) Copier l'APK produit (chemin par flavor + type)
mkdir -p apk
FLAVOR_LC="$( [ "$TARGET" = admin ] && echo admin || echo gextimo )"
APK_SRC="android/app/build/outputs/apk/${FLAVOR_LC}/${BUILD_KIND}/app-${FLAVOR_LC}-${BUILD_KIND}.apk"
APK_OUT="apk/gextimo-${TARGET}-${BUILD_KIND}.apk"
cp "$APK_SRC" "$APK_OUT" && echo "📦 APK : $APK_OUT ($BUILD_KIND)"

# 7) Restaurer les fichiers mutés : le dépôt doit ressortir du build tel qu'il
# y est entré, quelle que soit la saveur construite.
mv capacitor.config.json.bak capacitor.config.json
mv android/app/build.gradle.bak android/app/build.gradle

echo "✅ APK généré : $APK_OUT"
echo "   Pour installer : adb install -r $APK_OUT"
