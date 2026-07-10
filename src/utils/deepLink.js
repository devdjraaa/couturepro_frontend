// Pont de navigation pour le deep-link des notifications.
// Le tap sur une notification du rideau arrive HORS de React Router (listener natif).
// Ce module conserve la fonction `navigate` de React Router et permet d'y accéder de
// partout ; si le tap arrive avant que l'app soit prête, la cible est mise en attente.

let _navigate = null
let _pending = null

/** Enregistre le navigateur de React Router (appelé par un composant sous le Router). */
export function setDeepLinkNavigator(fn) {
  _navigate = fn
  if (_pending) {
    const target = _pending
    _pending = null
    try { fn(target) } catch { /* route invalide : on ignore */ }
  }
}

/** Navigue vers un lien interne (ex. "/commandes/{id}"). File d'attente si l'app n'est pas prête. */
export function goToDeepLink(lien) {
  if (!lien || typeof lien !== 'string') return
  if (_navigate) {
    try { _navigate(lien) } catch { /* route invalide */ }
  } else {
    _pending = lien
  }
}
