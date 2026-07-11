#!/usr/bin/env bash
#
# Publie un bundle OTA (partie web) sur le VPS pour @capgo/capacitor-updater.
# Ne met à jour QUE la couche web (JS/CSS/HTML) — pour les corrections mineures.
# Pour un changement natif (plugin, permission), il faut une nouvelle APK.
#
# Usage :  ./scripts/publish-ota.sh <version>
# Exemple : ./scripts/publish-ota.sh 1.0.1
#
set -e

VERSION="${1:?Usage: publish-ota.sh <version>  (ex: 1.0.1)}"
VPS="novafriq"
REMOTE_DIR="/var/www/app-bundles"
ZIP="ota-${VERSION}.zip"

echo "==> 1/4  Build web"
npm run build

echo "==> 2/4  Zip du dossier dist -> ${ZIP}"
( cd dist && zip -qr "../${ZIP}" . )

echo "==> 3/4  Envoi vers le VPS"
scp "${ZIP}" "${VPS}:/tmp/${ZIP}"
ssh "${VPS}" "sudo mv /tmp/${ZIP} ${REMOTE_DIR}/${ZIP} && sudo chown www-data:www-data ${REMOTE_DIR}/${ZIP}"
rm -f "${ZIP}"

URL="https://gextimoapi.novafriq.africa/app-bundles/${ZIP}"
echo ""
echo "==> 4/4  Bundle publie : ${URL}"
echo ""
echo "Pour l'ACTIVER, ajoute dans le .env du backend (VPS) :"
echo "    APP_OTA_VERSION=${VERSION}"
echo "    APP_OTA_URL=${URL}"
echo "puis :  php artisan config:cache"
echo ""
echo "Les apps recuperent la mise a jour au prochain lancement (silencieux)."
