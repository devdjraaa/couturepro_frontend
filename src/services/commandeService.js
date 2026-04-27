import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockCommandes } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

const flattenCommande = (c) => ({
  ...c,
  client_nom:   c.client   ? `${c.client.prenom ?? ''} ${c.client.nom ?? ''}`.trim() : '',
  vetement_nom: c.vetement?.nom ?? '',
})

const toFormData = (payload) => {
  const fd = new FormData()
  const fields = ['client_id', 'vetement_id', 'prix', 'acompte', 'mode_paiement_acompte', 'date_livraison_prevue', 'note_interne', 'description', 'statut']
  fields.forEach(k => { if (payload[k] != null && payload[k] !== '') fd.append(k, payload[k]) })
  if (payload.urgence != null) fd.append('urgence', payload.urgence ? '1' : '0')
  if (payload.photo_tissu instanceof File) fd.append('photo_tissu', payload.photo_tissu)
  return fd
}

export const commandeService = {
  async getAll({ statut = '', client_id = null } = {}) {
    if (isMock()) {
      await delay()
      let list = [...mockCommandes]
      if (statut)    list = list.filter(c => c.statut === statut)
      if (client_id) list = list.filter(c => c.client_id === client_id || c.client_id === Number(client_id))
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      return list.map(flattenCommande)
    }
    const params = {}
    if (statut)    params.statut    = statut
    if (client_id) params.client_id = client_id
    const { data } = await api.get('/commandes', { params })
    return data
  },

  async getById(id) {
    if (isMock()) {
      await delay()
      const commande = mockCommandes.find(c => c.id === id || c.id === Number(id))
      if (!commande) throw { code: 'non_trouve' }
      return flattenCommande(commande)
    }
    const { data } = await api.get(`/commandes/${id}`)
    return data
  },

  async create(payload) {
    if (isMock()) {
      await delay()
      const newCommande = {
        id: String(Date.now()),
        ...payload,
        photo_tissu_url: payload.photo_tissu instanceof File ? URL.createObjectURL(payload.photo_tissu) : null,
        statut: 'en_cours',
        date_commande: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockCommandes.push(newCommande)
      return newCommande
    }
    const body = toFormData(payload)
    const { data } = await api.post('/commandes', body)
    return data
  },

  async update(id, payload) {
    if (isMock()) {
      await delay()
      const idx = mockCommandes.findIndex(c => c.id === id || c.id === Number(id))
      if (idx === -1) throw { code: 'non_trouve' }
      mockCommandes[idx] = { ...mockCommandes[idx], ...payload, updated_at: new Date().toISOString() }
      return mockCommandes[idx]
    }
    const fd = toFormData(payload)
    fd.append('_method', 'PUT')
    const { data } = await api.post(`/commandes/${id}`, fd)
    return data
  },

  async updateStatut(id, statut) {
    if (isMock()) {
      await delay()
      const idx = mockCommandes.findIndex(c => c.id === id || c.id === Number(id))
      if (idx === -1) throw { code: 'non_trouve' }
      mockCommandes[idx].statut = statut
      mockCommandes[idx].updated_at = new Date().toISOString()
      return mockCommandes[idx]
    }
    const { data } = await api.put(`/commandes/${id}`, { statut })
    return data
  },

  async delete(id) {
    if (isMock()) {
      await delay()
      const idx = mockCommandes.findIndex(c => c.id === id || c.id === Number(id))
      if (idx !== -1) mockCommandes.splice(idx, 1)
      return
    }
    await api.delete(`/commandes/${id}`)
  },

  async getStats() {
    const computeStats = (list) => {
      const actives     = list.filter(c => c.statut === 'en_cours')
      const nonTerminee = list.filter(c => !['livre', 'annule'].includes(c.statut))
      const now         = Date.now()
      const h48         = now + 48 * 60 * 60 * 1000

      return {
        en_cours:       actives.length,
        livre:          list.filter(c => c.statut === 'livre').length,
        annule:         list.filter(c => c.statut === 'annule').length,
        total_encaisse: list.filter(c => c.statut !== 'annule').reduce((s, c) => s + Number(c.acompte ?? 0), 0),
        total_restant:  actives.reduce((s, c) => s + Math.max(0, Number(c.prix ?? 0) - Number(c.acompte ?? 0)), 0),
        en_retard:      nonTerminee.filter(c => c.date_livraison_prevue && new Date(c.date_livraison_prevue).getTime() < now).length,
        dans_48h:       nonTerminee.filter(c => {
          if (!c.date_livraison_prevue) return false
          const t = new Date(c.date_livraison_prevue).getTime()
          return t >= now && t <= h48
        }).length,
      }
    }

    if (isMock()) {
      await delay(200)
      return computeStats(mockCommandes)
    }
    const { data: list } = await api.get('/commandes')
    return computeStats(list)
  },
}
