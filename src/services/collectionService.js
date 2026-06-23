import api from './api'
import { isMock } from '@/services/mockFlag'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))
let mock = []

export const collectionService = {
  async getAll() {
    if (isMock()) { await delay(); return mock }
    const { data } = await api.get('/collections')
    return data
  },

  async create(nom) {
    if (isMock()) { await delay(); const c = { id: String(Date.now()), nom, vetements_count: 0 }; mock.push(c); return c }
    const { data } = await api.post('/collections', { nom })
    return data
  },

  async remove(id) {
    if (isMock()) { await delay(); mock = mock.filter((c) => c.id !== id); return }
    await api.delete(`/collections/${id}`)
  },
}
