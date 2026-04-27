import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockUser, mockAtelier } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const parametresService = {
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
    const { data } = await api.put('/parametres/profil', {
      nom:       payload.nom,
      telephone: payload.telephone,
      email:     payload.email,
    })
    return data
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
    const { data } = await api.put('/parametres/atelier', {
      nom:     payload.nom,
      adresse: payload.adresse,
      ville:   payload.ville,
    })
    return data
  },

  async getCommunications() {
    if (isMock()) {
      await delay()
      return { confirmation_commande: false, rappel_livraison_j2: false, commande_prete: false, whatsapp_enabled: false }
    }
    const { data } = await api.get('/parametres/communications')
    return data
  },

  async updateCommunications(payload) {
    if (isMock()) {
      await delay()
      return payload
    }
    const { data } = await api.put('/parametres/communications', payload)
    return data
  },

  async changerMotDePasse(payload) {
    if (isMock()) {
      await delay()
      return
    }
    const { data } = await api.put('/parametres/mot-de-passe', {
      ancien:  payload.ancien,
      nouveau: payload.nouveau,
    })
    return data
  },

  async getPreferences() {
    if (isMock()) {
      await delay()
      return {
        devise:       mockAtelier.abonnement?.config ? 'XOF' : 'XOF',
        unite_mesure: 'cm',
      }
    }
    const { data } = await api.get('/parametres/preferences')
    return data
  },

  async updatePreferences(payload) {
    if (isMock()) {
      await delay()
      return payload
    }
    const { data } = await api.put('/parametres/preferences', {
      devise:       payload.devise,
      unite_mesure: payload.unite_mesure,
    })
    return data
  },
}
