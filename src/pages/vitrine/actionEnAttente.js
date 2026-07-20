// EC-3 — Reprise d'action après connexion.
//
// Un visiteur qui clique sur une action réservée aux comptes (suivre un créateur,
// commander…) est envoyé vers l'espace client. Sans mémoire de son intention, il
// se connecte puis atterrit sur une page vide : l'action est perdue et c'est à lui
// de la refaire. On mémorise donc l'intention avant de l'envoyer se connecter,
// puis on la rejoue une fois connecté et on le ramène d'où il venait.
//
// Volontairement en `sessionStorage` : une intention est le prolongement d'un
// geste, pas une préférence durable. Elle ne doit pas ressurgir dans un onglet
// voisin ni la semaine suivante.

const CLE = 'gx_action_attente'

// Au-delà de ce délai, l'intention ne correspond plus à ce que l'utilisateur avait
// en tête — mieux vaut ne rien faire que d'agir à sa place sur une vieille décision.
const VALIDITE_MS = 30 * 60 * 1000

/**
 * @param {string} type     identifiant d'action ('suivre_createur', 'commander'…)
 * @param {object} payload  ce qu'il faut pour la rejouer (ids, libellés…)
 * @param {string} retour   chemin où ramener l'utilisateur ensuite
 */
export function memoriserAction(type, payload = {}, retour = null) {
  try {
    sessionStorage.setItem(CLE, JSON.stringify({
      type,
      payload,
      retour: retour ?? `${window.location.pathname}${window.location.search}`,
      at: Date.now(),
    }))
  } catch { /* stockage indisponible : on perd la reprise, pas la connexion */ }
}

/** Lit l'intention SANS la consommer (pour afficher « on va reprendre X »). */
export function lireAction() {
  try {
    const brut = sessionStorage.getItem(CLE)
    if (!brut) return null
    const a = JSON.parse(brut)
    if (!a?.type || Date.now() - (a.at || 0) > VALIDITE_MS) {
      sessionStorage.removeItem(CLE)
      return null
    }
    return a
  } catch {
    return null
  }
}

/** Lit ET efface : une intention ne se rejoue qu'une fois. */
export function consommerAction() {
  const a = lireAction()
  try { sessionStorage.removeItem(CLE) } catch { /* ignore */ }
  return a
}

export function oublierAction() {
  try { sessionStorage.removeItem(CLE) } catch { /* ignore */ }
}
