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
    // Transmet tout le payload ; le backend valide/filtre (nom requis + champs
    // optionnels : adresse, ville, contact_public, specialite, bio, réseaux, lat/lng).
    const { data } = await api.put('/parametres/atelier', payload)
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

  async getLangue() {
    if (isMock()) { await delay(); return { langue: localStorage.getItem('cp_lang') ?? 'fr' } }
    const { data } = await api.get('/parametres/langue')
    return data
  },

  async updateLangue(langue) {
    if (isMock()) { await delay(); localStorage.setItem('cp_lang', langue); return { langue } }
    const { data } = await api.put('/parametres/langue', { langue })
    return data
  },

  async getFactureSettings() {
    if (isMock()) {
      await delay()
      return {
        format_facture: 'standard',
        facture_logo_url: null,
        facture_ifu: null,
        facture_rccm: null,
        facture_pied_page: null,
        personnalisation_dispo: false,
        assujetti_tva: false,
        emecef_configure: false,
        atelier_nom: mockAtelier?.nom ?? 'Gextimo',
        atelier_adresse: mockAtelier?.adresse ?? '',
        atelier_ville: mockAtelier?.ville ?? '',
      }
    }
    const { data } = await api.get('/parametres/facture')
    return data
  },

  async updateFactureSettings(payload) {
    if (isMock()) {
      await delay()
      return payload
    }
    const body = {
      format_facture:    payload.format_facture,
      facture_ifu:       payload.facture_ifu,
      facture_rccm:      payload.facture_rccm,
      facture_pied_page: payload.facture_pied_page,
      assujetti_tva:     payload.assujetti_tva,
    }
    // N'envoyer le jeton que s'il est saisi (vide = conserver l'existant).
    if (payload.emecef_token) body.emecef_token = payload.emecef_token
    const { data } = await api.put('/parametres/facture', body)
    return data
  },

  async uploadFactureLogo(file) {
    if (isMock()) {
      await delay()
      return { facture_logo_url: URL.createObjectURL(file) }
    }
    const fd = new FormData()
    fd.append('logo', file)
    const { data } = await api.post('/parametres/facture/logo', fd)
    return data
  },

  async uploadAtelierLogo(file) {
    if (isMock()) {
      await delay()
      return { logo_url: URL.createObjectURL(file) }
    }
    const fd = new FormData()
    fd.append('logo', file)
    const { data } = await api.post('/parametres/atelier/logo', fd)
    return data
  },

  async registerFcmToken(fcm_token, platform = null) {
    try {
      await api.post('/notifications/fcm-token', { fcm_token, platform })
    } catch {}
  },

  async removeFcmToken() {
    try { await api.delete('/notifications/fcm-token') } catch {}
  },

  async demanderVerification({ fichier, lien }) {
    const fd = new FormData()
    if (fichier) fd.append('document', fichier)
    if (lien)    fd.append('lien', lien)
    const { data } = await api.post('/parametres/demande-verification', fd)
    return data
  },
}
