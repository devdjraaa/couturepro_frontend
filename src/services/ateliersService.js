import api from './api'
import { isMock } from './mockFlag'

const MOCK_ATELIERS = [
  {
    id: 'atelier-maitre-demo',
    nom: 'Atelier Principal',
    ville: 'Abidjan',
    is_maitre: true,
    statut: 'essai',
    clients_count: 12,
    commandes_count: 8,
    abonnement: { statut: 'essai', niveau_cle: 'standard_mensuel', jours_restants: 10 },
  },
  {
    id: 'atelier-sous-demo',
    nom: 'Atelier Yopougon',
    ville: 'Abidjan',
    is_maitre: false,
    statut: 'essai',
    clients_count: 5,
    commandes_count: 3,
    abonnement: { statut: 'essai', niveau_cle: 'standard_mensuel', jours_restants: 7 },
  },
]

export const ateliersService = {
  async getMesAteliers() {
    if (isMock()) return MOCK_ATELIERS
    const { data } = await api.get('/ateliers/mes-ateliers')
    return data
  },

  async createSousAtelier(payload) {
    if (isMock()) {
      return { id: 'new-' + Date.now(), ...payload, is_maitre: false, statut: 'essai' }
    }
    const { data } = await api.post('/ateliers', payload)
    return data
  },

  async getStats(atelierId) {
    if (isMock()) {
      const found = MOCK_ATELIERS.find(a => a.id === atelierId)
      return { ...found, commandes_en_cours: 2, commandes_retard: 1 }
    }
    const { data } = await api.get(`/ateliers/${atelierId}/stats`)
    return data
  },
}
