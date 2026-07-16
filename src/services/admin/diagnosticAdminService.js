import adminApi from '../adminApi'

// P110-111 : diagnostic système admin.
export const diagnosticAdminService = {
  async get() {
    const { data } = await adminApi.get('/diagnostic')
    return data
  },
}
