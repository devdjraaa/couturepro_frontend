import api from '@/services/api'
import { isMock } from '@/services/mockFlag'

const MOCK_PERMISSIONS = {
  assistant: [
    'clients.view', 'clients.create', 'clients.edit',
    'commandes.view', 'commandes.create', 'commandes.edit',
    'mesures.view', 'mesures.edit',
    'vetements.manage',
    'paiements.view', 'paiements.create',
    'notifications.view',
  ],
  membre: [
    'clients.view',
    'commandes.view', 'commandes.create',
    'mesures.view',
    'notifications.view',
  ],
}

export const equipeService = {
  async getAll() {
    if (isMock()) return []
    const { data } = await api.get('/equipe')
    return data
  },

  async invite(payload) {
    const { data } = await api.post('/equipe', payload)
    return data
  },

  async remove(membreId) {
    await api.delete(`/equipe/${membreId}`)
  },

  async getPermissions(role) {
    if (isMock()) return { role, permissions: MOCK_PERMISSIONS[role] ?? [] }
    const { data } = await api.get('/equipe/permissions', { params: { role } })
    return data
  },

  async updatePermissions(role, permissions) {
    if (isMock()) return { role, permissions }
    const { data } = await api.put('/equipe/permissions', { role, permissions })
    return data
  },
}
