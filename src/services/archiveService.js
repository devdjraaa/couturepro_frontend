import api from './api'

export const archiveService = {
  async getAll() {
    const { data } = await api.get('/archives')
    return data
  },

  async archiver(entityType, entityId, note = '') {
    const urls = {
      client:   `/clients/${entityId}/archiver`,
      commande: `/commandes/${entityId}/archiver`,
      mesure:   `/mesures/${entityId}/archiver`,
    }
    const { data } = await api.post(urls[entityType], { note })
    return data
  },

  async desarchiver(entityType, entityId) {
    const urls = {
      client:   `/clients/${entityId}/desarchiver`,
      commande: `/commandes/${entityId}/desarchiver`,
      mesure:   `/mesures/${entityId}/desarchiver`,
    }
    const { data } = await api.post(urls[entityType])
    return data
  },
}
