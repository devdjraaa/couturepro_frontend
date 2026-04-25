import { USE_MOCKS } from '@/constants/config'
import { mockClients } from './mockData'

const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))

// Les photos VIP sont stockées localement sur l'appareil (blueprint)
// L'upload vers le serveur est une feature future (TODO backend)
export const photoVipService = {
  async upload(clientId, file) {
    if (USE_MOCKS) {
      await delay()
      const client = mockClients.find(c => c.id === clientId)
      if (client) client.photo_url = URL.createObjectURL(file)
      return { photo_url: client?.photo_url ?? null }
    }
    // TODO: endpoint POST /clients/{id}/photo à implémenter
    throw { code: 'non_disponible', message: 'Upload de photo en cours de déploiement.' }
  },

  async delete(clientId) {
    if (USE_MOCKS) {
      await delay(300)
      const client = mockClients.find(c => c.id === clientId)
      if (client) client.photo_url = null
      return
    }
    // TODO: endpoint DELETE /clients/{id}/photo à implémenter
    throw { code: 'non_disponible', message: 'Suppression de photo en cours de déploiement.' }
  },
}
