import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockClients } from './mockData'

const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))

export const photoVipService = {
  async upload(clientId, file) {
    if (USE_MOCKS) {
      await delay()
      const client = mockClients.find(c => c.id === Number(clientId))
      if (client) client.photo_url = URL.createObjectURL(file)
      return { photo_url: client?.photo_url ?? null }
    }
    const formData = new FormData()
    formData.append('photo', file)
    const { data } = await api.post(`/clients/${clientId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async delete(clientId) {
    if (USE_MOCKS) {
      await delay(300)
      const client = mockClients.find(c => c.id === Number(clientId))
      if (client) client.photo_url = null
      return
    }
    await api.delete(`/clients/${clientId}/photo`)
  },
}
