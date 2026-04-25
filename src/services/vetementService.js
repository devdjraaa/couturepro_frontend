import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockVetements } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

const toFormData = (payload) => {
  const fd = new FormData()
  if (payload.nom) fd.append('nom', payload.nom)
  if (payload.image instanceof File) fd.append('image', payload.image)
  return fd
}

export const vetementService = {
  async getAll() {
    if (isMock()) {
      await delay()
      return mockVetements.filter(v => !v.is_archived)
    }
    const { data } = await api.get('/vetements')
    return data
  },

  async create(payload) {
    if (isMock()) {
      await delay()
      const newVetement = {
        id: String(Date.now()),
        ...payload,
        image_url: payload.image instanceof File ? URL.createObjectURL(payload.image) : null,
        is_systeme:  false,
        is_archived: false,
        created_at:  new Date().toISOString(),
      }
      mockVetements.push(newVetement)
      return newVetement
    }
    const { data } = await api.post('/vetements', toFormData(payload))
    return data
  },

  async update(id, payload) {
    if (isMock()) {
      await delay()
      const idx = mockVetements.findIndex(v => v.id === id || v.id === Number(id))
      if (idx === -1) throw { code: 'non_trouve' }
      mockVetements[idx] = {
        ...mockVetements[idx],
        ...payload,
        image_url: payload.image instanceof File ? URL.createObjectURL(payload.image) : mockVetements[idx].image_url,
      }
      return mockVetements[idx]
    }
    // PHP ne parse pas FormData sur PUT — on utilise POST + _method=PUT
    const fd = toFormData(payload)
    fd.append('_method', 'PUT')
    const { data } = await api.post(`/vetements/${id}`, fd)
    return data
  },

  async delete(id) {
    if (isMock()) {
      await delay()
      const idx = mockVetements.findIndex(v => v.id === id || v.id === Number(id))
      if (idx !== -1) mockVetements[idx].is_archived = true
      return
    }
    await api.delete(`/vetements/${id}`)
  },
}
