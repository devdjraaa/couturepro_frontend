import adminApi from '../adminApi'

// P153-158 : gestion admin des codes promo / ambassadeurs
export const codesPromoAdminService = {
  async getAll(params = {}) {
    const { data } = await adminApi.get('/codes-promo', { params })
    return data
  },

  async getById(id) {
    const { data } = await adminApi.get(`/codes-promo/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await adminApi.post('/codes-promo', payload)
    return data
  },

  async toggle(id) {
    const { data } = await adminApi.post(`/codes-promo/${id}/toggle`)
    return data
  },
}
