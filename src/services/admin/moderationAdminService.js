import adminApi from '../adminApi'

/**
 * Modération des contenus publiés par les créateurs : avis, annonces, vidéos.
 *
 * Les routes existaient côté serveur depuis leur création, mais AUCUN écran ne
 * les appelait — la file de modération se remplissait sans que personne puisse
 * la traiter. C'est le pendant du correctif des signalements : on ne sanctionne
 * plus automatiquement, donc il faut pouvoir sanctionner à la main.
 */
export const moderationAdminService = {
  /* ── Avis ── filtre : signales | masques | photos ────────────────────── */
  async avis(params = {}) {
    const { data } = await adminApi.get('/avis', { params })
    return data
  },
  async avisCompteurs() {
    const { data } = await adminApi.get('/avis/compteurs')
    return data
  },
  async masquerAvis(id, motif) {
    const { data } = await adminApi.post(`/avis/${id}/masquer`, { motif })
    return data
  },
  async retablirAvis(id) {
    const { data } = await adminApi.post(`/avis/${id}/retablir`)
    return data
  },
  /** action : valider | refuser — ne concerne QUE les photos jointes à l'avis. */
  async modererPhotosAvis(id, action) {
    const { data } = await adminApi.post(`/avis/${id}/photos`, { action })
    return data
  },

  /* ── Annonces ── filtre : masquees | (défaut : signalées en ligne) ───── */
  async annonces(params = {}) {
    const { data } = await adminApi.get('/annonces', { params })
    return data
  },
  async annoncesCompteurs() {
    const { data } = await adminApi.get('/annonces/compteurs')
    return data
  },
  /** Le motif est OBLIGATOIRE : il est repris tel quel dans l'avis au créateur. */
  async masquerAnnonce(id, motif) {
    const { data } = await adminApi.post(`/annonces/${id}/masquer`, { motif })
    return data
  },
  async retablirAnnonce(id) {
    const { data } = await adminApi.post(`/annonces/${id}/retablir`)
    return data
  },

  /* ── Vidéos ── statut : en_attente | publiee | refusee ───────────────── */
  async videos(params = {}) {
    const { data } = await adminApi.get('/atelier-videos', { params })
    return data
  },
  async videosCompteurs() {
    const { data } = await adminApi.get('/atelier-videos/compteurs')
    return data
  },
  async approuverVideo(id) {
    const { data } = await adminApi.post(`/atelier-videos/${id}/approuver`)
    return data
  },
  /** Le motif de refus est obligatoire — le créateur doit savoir pourquoi. */
  async refuserVideo(id, motifRefus) {
    const { data } = await adminApi.post(`/atelier-videos/${id}/refuser`, { motif_refus: motifRefus })
    return data
  },
}
