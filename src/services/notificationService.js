import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockNotifications } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const notificationService = {
  async getAll() {
    if (isMock()) {
      await delay()
      return [...mockNotifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    const { data } = await api.get('/notifications')
    const list = Array.isArray(data) ? data : (data.data ?? [])
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  async countNonLues() {
    if (isMock()) {
      await delay(150)
      return mockNotifications.filter(n => !n.lu).length
    }
    const list = await notificationService.getAll()
    return list.filter(n => !n.lu).length
  },

  async marquerLue(id) {
    if (isMock()) {
      await delay(150)
      const notif = mockNotifications.find(n => n.id === id || n.id === Number(id))
      if (notif) notif.lu = true
      return
    }
    await api.post('/notifications/mark-as-read', { ids: [id] })
  },

  async marquerToutesLues() {
    if (isMock()) {
      await delay()
      mockNotifications.forEach(n => { n.lu = true })
      return
    }
    await api.post('/notifications/mark-as-read', { all: true })
  },
}
