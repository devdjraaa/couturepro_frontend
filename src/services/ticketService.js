import api from './api'
import { isMock } from '@/services/mockFlag'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

const mockTickets = []

export const ticketService = {
  async getAll() {
    if (isMock()) {
      await delay()
      return [...mockTickets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    try {
      const { data } = await api.get('/support/tickets')
      return Array.isArray(data) ? data : (data?.data ?? [])
    } catch (err) {
      if (err.code === 'non_trouve') return []
      throw err
    }
  },

  async getById(id) {
    if (isMock()) {
      await delay()
      const ticket = mockTickets.find(t => t.id === id)
      if (!ticket) throw { code: 'non_trouve' }
      return { ...ticket, messages: ticket.messages ?? [] }
    }
    const { data } = await api.get(`/support/tickets/${id}`)
    return data
  },

  async creer(payload) {
    if (isMock()) {
      await delay()
      const ticket = {
        id: String(Date.now()),
        sujet:     payload.get ? payload.get('sujet') : payload.sujet,
        categorie: payload.get ? payload.get('categorie') : payload.categorie,
        statut:    'ouvert',
        created_at: new Date().toISOString(),
        messages:  [],
      }
      mockTickets.push(ticket)
      return ticket
    }
    const { data } = await api.post('/support/tickets', payload)
    return data
  },

  async repondre(id, payload) {
    if (isMock()) {
      await delay()
      const ticket = mockTickets.find(t => t.id === id)
      if (!ticket) throw { code: 'non_trouve' }
      const msg = {
        id:              String(Date.now()),
        expediteur_type: 'proprietaire',
        contenu:         payload.get ? payload.get('message') : payload.message,
        pj_url:          null,
        created_at:      new Date().toISOString(),
      }
      ticket.messages = [...(ticket.messages ?? []), msg]
      return msg
    }
    const { data } = await api.post(`/support/tickets/${id}/repondre`, payload)
    return data
  },
}
