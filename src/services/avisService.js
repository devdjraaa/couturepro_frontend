// Avis v2 (20/07) : la soumission et le signalement vivent dans `vitrineApi`
// (jeton CLIENT + statut HTTP détaillé). Ici : uniquement le côté créateur.
import api from './api'
import { isMock } from '@/services/mockFlag'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export const avisService = {
  // Avis de mon atelier (créateur connecté).
  async getMine() {
    if (isMock()) { await delay(); return [] }
    const { data } = await api.get('/avis')
    return data
  },

  // S08C-29 : la modération par le créateur a été RETIRÉE — il était juge et
  // partie et pouvait rejeter tout avis négatif. Les avis sont publiés
  // automatiquement ; l'arbitrage se fait côté admin, a posteriori.

}
