import api from './api'

export const creationDesignerService = {
  async list(categorie = null) {
    const params = categorie ? { categorie } : {}
    const { data } = await api.get('/creations-designer', { params })
    return data
  },

  async get(id) {
    const { data } = await api.get(`/creations-designer/${id}`)
    return data
  },

  async create(payload) {
    const fd = new FormData()
    fd.append('categorie', payload.categorie)
    fd.append('titre', payload.titre)
    if (payload.description) fd.append('description', payload.description)
    if (payload.public != null) fd.append('public', payload.public ? '1' : '0')
    if (payload.metadata) fd.append('metadata', JSON.stringify(payload.metadata))
    if (payload.images?.length) {
      payload.images.forEach(f => fd.append('images[]', f))
    }
    const { data } = await api.post('/creations-designer', fd)
    return data
  },

  async update(id, payload) {
    const fd = new FormData()
    if (payload.titre) fd.append('titre', payload.titre)
    if (payload.description !== undefined) fd.append('description', payload.description || '')
    if (payload.public != null) fd.append('public', payload.public ? '1' : '0')
    if (payload.metadata) fd.append('metadata', JSON.stringify(payload.metadata))
    if (payload.images?.length) {
      payload.images.forEach(f => fd.append('images[]', f))
    }
    const { data } = await api.post(`/creations-designer/${id}`, fd)
    return data
  },

  async remove(id) {
    await api.delete(`/creations-designer/${id}`)
  },
}
