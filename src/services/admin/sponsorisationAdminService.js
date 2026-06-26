import adminApi from '../adminApi'

export const sponsorisationAdminService = {
  async get() {
    const { data } = await adminApi.get('/vitrine/sponsorisation')
    return data
  },

  async update(payload) {
    const { data } = await adminApi.put('/vitrine/sponsorisation', payload)
    return data
  },
}
