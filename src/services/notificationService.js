import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockNotifications } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const notificationService = {
  async getAll() {
    if (USE_MOCKS) {
      await delay()
      return [...mockNotifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    const { data } = await api.get('/notifications')
    return data
  },

  async countNonLues() {
    if (USE_MOCKS) {
      await delay(150)
      return mockNotifications.filter(n => !n.lu).length
    }
    const { data } = await api.get('/notifications/count')
    return data.count
  },

  async marquerLue(id) {
    if (USE_MOCKS) {
      await delay(150)
      const notif = mockNotifications.find(n => n.id === Number(id))
      if (notif) notif.lu = true
      return
    }
    await api.patch(`/notifications/${id}/lue`)
  },

  async marquerToutesLues() {
    if (USE_MOCKS) {
      await delay()
      mockNotifications.forEach(n => { n.lu = true })
      return
    }
    await api.post('/notifications/tout-lire')
  },
}
