import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockUser, mockAtelier } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const parametresService = {
  // Profil = données du proprietaire via /auth/me
  async getProfil() {
    if (isMock()) {
      await delay()
      return mockUser
    }
    const { data } = await api.get('/auth/me')
    const { atelier_maitre, ...proprietaire } = data
    return proprietaire
  },

  async updateProfil(payload) {
    if (isMock()) {
      await delay()
      Object.assign(mockUser, payload)
      return mockUser
    }
    // TODO: endpoint PUT /parametres/profil à implémenter
    throw { code: 'non_disponible', message: 'Modification du profil en cours de déploiement.' }
  },

  async getAtelier() {
    if (isMock()) {
      await delay()
      return mockAtelier
    }
    const { data } = await api.get('/auth/me')
    return data.atelier_maitre ?? null
  },

  async updateAtelier(payload) {
    if (isMock()) {
      await delay()
      Object.assign(mockAtelier, payload)
      return mockAtelier
    }
    // TODO: endpoint PUT /parametres/atelier à implémenter
    throw { code: 'non_disponible', message: 'Modification de l\'atelier en cours de déploiement.' }
  },

  async changerMotDePasse(payload) {
    if (isMock()) {
      await delay()
      return
    }
    // TODO: endpoint PUT /parametres/mot-de-passe à implémenter
    throw { code: 'non_disponible', message: 'Changement de mot de passe en cours de déploiement.' }
  },
}
