import api from './api'

export const signalementService = {
  // Signalement public (fire-and-forget). type : profil | creation | avis.
  report(type, cibleId, motif = null) {
    return api.post('/vitrine/signaler', { type, cible_id: cibleId, motif }).catch(() => {})
  },
}
