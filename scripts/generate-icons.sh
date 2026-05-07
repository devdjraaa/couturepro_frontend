#!/usr/bin/env bash
set -euo pipefail

# Génère les icônes Android pour user et admin dans assets/icons/{user,admin}/
# Utilise ImageMagick (magick).

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Tailles requises pour Android (densité → taille_carrée:taille_foreground)
declare -A SIZES=(
  [mdpi]="48:108"
  [hdpi]="72:162"
  [xhdpi]="96:216"
  [xxhdpi]="144:324"
  [xxxhdpi]="192:432"
)

generate_icon() {
  local target=$1   # user | admin
  local color=$2    # couleur de fond
  local color2=$3   # couleur dégradé
  local letter=$4   # lettre centrale

  local out_dir="$ROOT/assets/icons/$target"
  mkdir -p "$out_dir"

  # 1) Icône source 1024×1024 avec coins arrondis
  magick -size 1024x1024 \
    radial-gradient:"$color2"-"$color" \
    -gravity center \
    -font "$FONT" -fill white -pointsize 700 \
    -annotate +0+50 "$letter" \
    \( -size 1024x1024 xc:none -fill white -draw "roundrectangle 0,0 1023,1023 180,180" \) \
    -compose DstIn -composite \
    "$out_dir/ic_launcher_1024.png"

  # 2) Foreground (lettre seule, fond transparent — pour adaptive icons)
  magick -size 1024x1024 xc:none \
    -gravity center \
    -font "$FONT" -fill white -pointsize 700 \
    -annotate +0+50 "$letter" \
    "$out_dir/ic_launcher_foreground_1024.png"

  # 3) Toutes les densités
  for density in "${!SIZES[@]}"; do
    IFS=':' read -r sq fg <<< "${SIZES[$density]}"
    mkdir -p "$out_dir/mipmap-$density"
    magick "$out_dir/ic_launcher_1024.png" -resize "${sq}x${sq}" "$out_dir/mipmap-$density/ic_launcher.png"
    magick "$out_dir/ic_launcher_1024.png" -resize "${sq}x${sq}" \
      \( +clone -alpha extract -draw "fill black polygon 0,0 0,${sq} ${sq},0 fill white circle $((sq/2)),$((sq/2)) $((sq/2)),0" -alpha off -compose copy_opacity -composite \) \
      -alpha set "$out_dir/mipmap-$density/ic_launcher_round.png" 2>/dev/null || \
      magick "$out_dir/ic_launcher_1024.png" -resize "${sq}x${sq}" "$out_dir/mipmap-$density/ic_launcher_round.png"
    magick "$out_dir/ic_launcher_foreground_1024.png" -resize "${fg}x${fg}" "$out_dir/mipmap-$density/ic_launcher_foreground.png"
  done

  echo "✅ Icônes $target générées dans $out_dir"
}

# User : violet (couleur de marque CouturePro), lettre C
generate_icon "user" "#7e14ff" "#a855f7" "C"

# Admin : rouge sombre, lettre A
generate_icon "admin" "#991b1b" "#dc2626" "A"
