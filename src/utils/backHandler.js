// Pile de handlers « retour » pour les overlays (modales, bottom-sheets, menus).
// Le bouton retour physique Android ferme d'abord l'overlay du dessus — comme le
// bouton « Annuler » de l'app — au lieu de naviguer dans l'historique (bug P4).
const stack = []

// Enregistre un handler de fermeture ; renvoie la fonction pour le retirer.
export function registerBackHandler(fn) {
  stack.push(fn)
  return () => {
    const i = stack.lastIndexOf(fn)
    if (i !== -1) stack.splice(i, 1)
  }
}

// Ferme l'overlay du dessus s'il y en a un. Renvoie true si un handler a agi.
export function runTopBackHandler() {
  const fn = stack[stack.length - 1]
  if (fn) {
    fn()
    return true
  }
  return false
}
