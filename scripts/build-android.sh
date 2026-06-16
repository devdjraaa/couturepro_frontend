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

# 1) Backup capacitor.config.json
cp capacitor.config.json capacitor.config.json.bak

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

# 4b) Patcher applicationId dans build.gradle (le namespace Java reste fixe)
sed -i "s/applicationId \"[^\"]*\"/applicationId \"$APP_ID\"/" android/app/build.gradle

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
  BG_COLOR="#7E14FF"
fi
sed -i "s|<color name=\"ic_launcher_background\">[^<]*</color>|<color name=\"ic_launcher_background\">$BG_COLOR</color>|" android/app/src/main/res/values/ic_launcher_background.xml

# 5) Build l'APK
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
  ANDROID_HOME=/home/kaido/Android/Sdk \
  ./android/gradlew -p android assembleDebug

# 6) Copier l'APK avec le suffixe target
mkdir -p apk
APK_OUT="apk/couturepro-$TARGET.apk"
cp android/app/build/outputs/apk/debug/app-debug.apk "$APK_OUT"

# 7) Restaurer capacitor.config.json
mv capacitor.config.json.bak capacitor.config.json

echo "✅ APK généré : $APK_OUT"
echo "   Pour installer : adb install -r $APK_OUT"
