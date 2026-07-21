import adminApi from '../adminApi'

/**
 * Suivi des performances de la Page Facebook.
 *
 * Le socle serveur existait depuis le 20/07 — collecte quotidienne, rapport des
 * meilleures publications et de leurs points communs — mais la route qui pose
 * le jeton n'avait AUCUN écran. Il fallait donc un développeur pour brancher
 * une Page, alors que c'est précisément le geste que la direction doit faire
 * elle-même.
 *
 * Le jeton n'est jamais renvoyé par le serveur : `statut` n'expose que ses
 * quatre derniers caractères, de quoi vérifier qu'on a bien posé le bon.
 */
export const reseauxAdminService = {
  async statut() {
    const { data } = await adminApi.get('/reseaux/statut')
    return data
  },

  async configurerFacebook({ page_id, token, actif }) {
    const { data } = await adminApi.put('/reseaux/facebook', { page_id, token, actif })
    return data
  },

  /** Déclenche une collecte immédiate — sert aussi à valider le jeton. */
  async collecter() {
    const { data } = await adminApi.post('/reseaux/collecter')
    return data
  },

  async rapport({ depuis = null, top = 5 } = {}) {
    const { data } = await adminApi.get('/reseaux/rapport', { params: { depuis, top } })
    return data
  },

  /** Étiquette le sujet d'une publication, pour retrouver ce qui marche. */
  async etiqueter(id, sujet) {
    const { data } = await adminApi.patch(`/reseaux/posts/${id}`, { sujet })
    return data
  },
}
