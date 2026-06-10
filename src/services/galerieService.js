import api from './api'

export const galerieService = {
  async getAll() {
    const { data } = await api.get('/galerie')
    return data
  },

  async getQuota() {
    const { data } = await api.get('/galerie/quota')
    return data
  },

  async upload(file, nom = '') {
    const fd = new FormData()
    fd.append('photo', file)
    if (nom) fd.append('nom', nom)
    const { data } = await api.post('/galerie', fd)
    return data
  },

  async delete(photoId) {
    await api.delete(`/galerie/${photoId}`)
  },
}
