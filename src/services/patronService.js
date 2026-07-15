import api from './api'

// P161-163 (côté créateur) : gestion des patrons payants attachés à ses créations.
const toFormData = (payload) => {
  const fd = new FormData()
  if (payload.vetement_id) fd.append('vetement_id', payload.vetement_id)
  if (payload.titre != null) fd.append('titre', payload.titre)
  if (payload.description != null) fd.append('description', payload.description)
  if (payload.prix != null) fd.append('prix', String(payload.prix))
  if (payload.actif != null) fd.append('actif', payload.actif ? '1' : '0')
  if (payload.fichier instanceof File) fd.append('fichier', payload.fichier)
  return fd
}

export const patronService = {
  async getAll() {
    const { data } = await api.get('/patrons')
    return data
  },

  async create(payload) {
    const { data } = await api.post('/patrons', toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async update(id, payload) {
    // La route accepte PUT|POST ; on passe par POST pour l'upload multipart.
    const { data } = await api.post(`/patrons/${id}`, toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async remove(id) {
    const { data } = await api.delete(`/patrons/${id}`)
    return data
  },
}
