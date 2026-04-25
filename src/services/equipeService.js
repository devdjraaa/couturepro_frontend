import { isMock } from '@/services/mockFlag'
import { mockEquipe } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

// Pas d'endpoint /equipe dans l'API publique backend (TODO)
export const equipeService = {
  async getAll() {
    if (isMock()) {
      await delay()
      return mockEquipe.filter(m => m.actif)
    }
    return []
  },

  async invite(payload) {
    if (isMock()) {
      await delay()
      const newMembre = {
        id: String(Date.now()),
        ...payload,
        actif: true,
        joined_at: new Date().toISOString(),
      }
      mockEquipe.push(newMembre)
      return newMembre
    }
    throw { code: 'non_disponible', message: 'Fonctionnalité en cours de déploiement.' }
  },

  async updateRole(membreId, role) {
    if (isMock()) {
      await delay()
      const membre = mockEquipe.find(m => m.id === membreId)
      if (!membre) throw { code: 'non_trouve' }
      membre.role = role
      return membre
    }
    throw { code: 'non_disponible', message: 'Fonctionnalité en cours de déploiement.' }
  },

  async remove(membreId) {
    if (isMock()) {
      await delay()
      const membre = mockEquipe.find(m => m.id === membreId)
      if (membre) membre.actif = false
      return
    }
    throw { code: 'non_disponible', message: 'Fonctionnalité en cours de déploiement.' }
  },
}
