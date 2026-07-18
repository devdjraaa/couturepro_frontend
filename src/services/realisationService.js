import api from './api'

// Point 101 — « Mes Réalisations » (publication modérée de photos par le pro).
export const realisationService = {
  async list() {
    const { data } = await api.get('/realisations')
    return data // { realisations, quota }
  },

  async quota() {
    const { data } = await api.get('/realisations/quota')
    return data
  },

  async create(payload) {
    const { data } = await api.post('/realisations', payload)
    return data.realisation
  },

  async update(id, payload) {
    const { data } = await api.put(`/realisations/${id}`, payload)
    return data.realisation
  },

  async addPhoto(id, file) {
    const fd = new FormData()
    fd.append('photo', file)
    const { data } = await api.post(`/realisations/${id}/photo`, fd)
    return data.realisation
  },

  async removePhoto(id, path) {
    const { data } = await api.delete(`/realisations/${id}/photo`, { data: { path } })
    return data.realisation
  },

  // La soumission exige la certification d'auteur ET le consentement des personnes.
  async submit(id) {
    const { data } = await api.post(`/realisations/${id}/soumettre`, {
      certifie_auteur: true,
      consentement_personnes: true,
    })
    return data.realisation
  },

  async remove(id) {
    await api.delete(`/realisations/${id}`)
  },
}
