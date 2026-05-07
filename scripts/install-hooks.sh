#!/usr/bin/env bash
# Installe les hooks git du repo dans .git/hooks/
# À lancer une seule fois par clone, ou après pull si de nouveaux hooks sont ajoutés.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_SRC="$ROOT/scripts/git-hooks"
HOOKS_DST="$ROOT/.git/hooks"

if [[ ! -d "$HOOKS_DST" ]]; then
  echo "❌ Pas de répertoire .git/hooks — t'es bien dans un repo git ?"
  exit 1
fi

for hook in "$HOOKS_SRC"/*; do
  name=$(basename "$hook")
  cp "$hook" "$HOOKS_DST/$name"
  chmod +x "$HOOKS_DST/$name"
  echo "✅ Hook installé : $name"
done
