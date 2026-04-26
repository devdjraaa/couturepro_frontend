import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockVetements } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

const toFormData = (payload) => {
  const fd = new FormData()
  if (payload.nom) fd.append('nom', payload.nom)
  if (payload.images && payload.images.length > 0) {
    payload.images.forEach(img => { if (img instanceof File) fd.append('images[]', img) })
  } else if (payload.image instanceof File) {
    fd.append('image', payload.image)
  }
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
      const firstImg = payload.images?.[0] ?? payload.image
      const newVetement = {
        id: String(Date.now()),
        ...payload,
        image_url: firstImg instanceof File ? URL.createObjectURL(firstImg) : null,
        images_urls: payload.images?.filter(f => f instanceof File).map(f => URL.createObjectURL(f)) ?? [],
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
      const firstImg = payload.images?.[0] ?? payload.image
      mockVetements[idx] = {
        ...mockVetements[idx],
        ...payload,
        image_url: firstImg instanceof File ? URL.createObjectURL(firstImg) : mockVetements[idx].image_url,
        images_urls: payload.images?.filter(f => f instanceof File).map(f => URL.createObjectURL(f)) ?? mockVetements[idx].images_urls,
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
