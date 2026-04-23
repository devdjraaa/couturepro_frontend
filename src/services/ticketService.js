import api from './api'
import { USE_MOCKS } from '@/constants/config'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

const mockTickets = []

export const ticketService = {
  async creer(payload) {
    if (USE_MOCKS) {
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
    if (USE_MOCKS) {
      await delay()
      return [...mockTickets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    const { data } = await api.get('/support/tickets')
    return data
  },
}
