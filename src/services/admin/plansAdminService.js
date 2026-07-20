import adminApi from '../adminApi'

export const plansAdminService = {
  /**
   * S02A-28b — Référentiel des clés configurables (libellé, type, unité).
   * L'écran des plans portait sa propre liste en dur, qui dérivait à chaque
   * nouvelle clé ajoutée par une migration.
   */
  async getFonctionnalites() {
    const { data } = await adminApi.get('/fonctionnalites')
    return data.fonctionnalites || []
  },

  async getAll(params = {}) {
    const { data } = await adminApi.get('/plans', { params })
    return data
  },

  async getById(id) {
    const { data } = await adminApi.get(`/plans/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await adminApi.post('/plans', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await adminApi.put(`/plans/${id}`, payload)
    return data
  },

  async toggle(id) {
    const { data } = await adminApi.post(`/plans/${id}/toggle`)
    return data
  },
}
