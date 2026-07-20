import api from './api'

/**
 * CLI-2 — « Gextimo Infos ».
 *
 * Onglet distinct des notifications : une notification dit ce qui est arrivé à
 * VOTRE atelier et appelle une action, une info est un message éditorial de
 * Gextimo vers la communauté (nouveauté, astuce, formation, alerte). Les
 * mélanger noierait les alertes qui comptent sous des annonces.
 *
 * Le ciblage — qui reçoit quoi — est résolu par le SERVEUR : le front ne filtre
 * rien, il affiche ce qu'il reçoit. Filtrer ici laisserait lire dans les outils
 * du navigateur des messages qui ne s'adressent pas à cet atelier.
 */
export const infosService = {
  async getAll() {
    try {
      const { data } = await api.get('/infos')

      return {
        infos: data?.data ?? [],
        // Les catégories (libellé, couleur, icône) viennent du serveur : aucune
        // correspondance en dur à maintenir dans l'écran.
        categories: data?.categories ?? [],
      }
    } catch (err) {
      if (err.code === 'non_trouve') return { infos: [], categories: [] }
      throw err
    }
  },

  async countNonLues() {
    try {
      const { data } = await api.get('/infos/compteur')
      return data?.non_lues ?? 0
    } catch {
      // Une pastille est un ornement : elle ne doit jamais faire échouer l'écran
      // qui la porte.
      return 0
    }
  },

  async marquerLue(id) {
    const { data } = await api.post(`/infos/${id}/lue`)
    return data
  },

  async marquerToutLu() {
    const { data } = await api.post('/infos/tout-lu')
    return data
  },
}
