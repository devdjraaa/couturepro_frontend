import api from './api'
import { isMock } from '@/services/mockFlag'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

const mockTickets = []

export const ticketService = {
  async creer(payload) {
    if (isMock()) {
      await delay()
      const ticket = {
        id: mockTickets.length + 1,
        ...payload,
        statut: 'ouvert',
        created_at: new Date().toISOString(),
      }
      mockTickets.push(ticket)
      return ticket
    }
    const { data } = await api.post('/support/tickets', payload)
    return data
  },

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
}
