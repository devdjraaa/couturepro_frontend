import api from './api'
import { setToken } from '@/utils/storage'

function normalizeMe(data) {
  const { atelier_maitre, ...proprietaire } = data
  const params  = atelier_maitre?.parametres ?? {}
  const atelier = atelier_maitre
    ? { ...atelier_maitre, devise: params.devise ?? 'XOF', unite_mesure: params.unite_mesure ?? 'cm' }
    : null
  return {
    user:    { ...proprietaire, role: 'proprietaire' },
    atelier,
  }
}

export const authService = {
  async login({ telephone, password }) {
    const { data: loginData } = await api.post('/auth/login', { telephone, password })
    setToken(loginData.token)
    const { data: meData } = await api.get('/auth/me')
    return normalizeMe(meData)
  },

  // Best-effort : tente d'invalider le token côté serveur.
  // Le clear local est géré par AuthContext.logout (qui appelle ce service
  // dans un try/catch pour ne jamais bloquer en cas d'offline).
  async logout() {
    await api.post('/auth/logout')
  },

  async register(payload) {
    const { data } = await api.post('/auth/inscription', payload)
    return data
  },

  async verifyOtp({ telephone, code }) {
    const { data } = await api.post('/auth/verifier-otp', { telephone, code })
    setToken(data.token)
    return {
      user:    { ...data.proprietaire, role: 'proprietaire' },
      atelier: data.atelier ?? null,
    }
  },

  async resendOtp(telephone) {
    await api.post('/auth/renvoyer-otp', { telephone })
  },

  async equipeLogin({ code_acces, password, device_id }) {
    const { data } = await api.post('/auth/equipe/login', { code_acces, password, device_id })
    setToken(data.token)
    return {
      user:    { ...data.membre, role: data.membre.role, permissions: data.permissions ?? [] },
      atelier: null,
    }
  },

  async getMe() {
    const { data } = await api.get('/auth/me')
    return normalizeMe(data)
  },

  // Récupération de compte
  // - Mode simple (mot de passe oublié) : passer { telephone } → flow rapide
  // - Mode complet (compte perdu / changement de numéro) : passer { email } → flow 5 étapes
  async recuperationEtape1({ email, telephone }) {
    const { data } = await api.post('/auth/recuperation/initier', { email, telephone })
    return data // { message, demande_id, email }
  },

  async recuperationEtape2({ demande_id, code }) {
    const { data } = await api.post('/auth/recuperation/verifier-otp', { demande_id, code })
    return data
  },

  async recuperationEtape3({ demande_id, telephone_nouveau }) {
    const { data } = await api.post('/auth/recuperation/nouveau-telephone', { demande_id, telephone_nouveau })
    return data
  },

  async recuperationEtape4({ demande_id, code }) {
    const { data } = await api.post('/auth/recuperation/verifier-otp-nouveau', { demande_id, code })
    return data
  },

  async recuperationEtape5({ demande_id, password, password_confirmation }) {
    const { data } = await api.post('/auth/recuperation/nouveau-mot-de-passe', { demande_id, password, password_confirmation })
    if (data.token) setToken(data.token)
    return data
  },
}
