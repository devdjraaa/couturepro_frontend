import api from './api'
import { isMock } from '@/services/mockFlag'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

const MOCK_FACTURES = [
  {
    id: 1,
    numero: 'FAC-2026-001',
    type: 'facture',
    statut: 'non_payee',
    client_nom: 'Aminata Diallo',
    client_telephone: '+221 77 000 0001',
    date_emission: '2026-06-01',
    date_echeance: '2026-06-15',
    lignes: [
      { description: 'Robe de soirée sur mesure', quantite: 1, prix_unitaire: 85000 },
      { description: 'Retouches', quantite: 2, prix_unitaire: 5000 },
    ],
    mode_paiement: 'wave',
    gabarit: 'standard',
    acompte: 0,
    code_tracage: 'GX-T-ABC123',
    qr_code_url: null,
    dgi_pdf_url: null,
    notes: '',
  },
  {
    id: 2,
    numero: 'FAC-2026-002',
    type: 'devis',
    statut: 'acompte',
    client_nom: 'Fatou Coulibaly',
    client_telephone: '+221 76 000 0002',
    date_emission: '2026-06-10',
    date_echeance: '2026-06-30',
    lignes: [
      { description: 'Tenue traditionnelle boubou', quantite: 1, prix_unitaire: 120000 },
    ],
    mode_paiement: 'om',
    gabarit: 'standard',
    acompte: 40000,
    code_tracage: 'GX-T-DEF456',
    qr_code_url: null,
    dgi_pdf_url: null,
    notes: 'Acompte de 40 000 FCFA reçu le 12/06',
  },
  {
    id: 3,
    numero: 'FAC-2026-003',
    type: 'recu',
    statut: 'soldee',
    client_nom: 'Mariam Traoré',
    client_telephone: '+221 78 000 0003',
    date_emission: '2026-05-20',
    date_echeance: '2026-05-20',
    lignes: [
      { description: 'Costume trois pièces', quantite: 1, prix_unitaire: 200000 },
    ],
    mode_paiement: 'especes',
    gabarit: 'standard',
    acompte: 0,
    code_tracage: 'GX-T-GHI789',
    qr_code_url: null,
    dgi_pdf_url: null,
    notes: '',
  },
]

let mockIdSeq = 10

export const factureService = {
  async getAll() {
    if (isMock()) { await delay(); return [...MOCK_FACTURES] }
    const { data } = await api.get('/factures')
    return data
  },

  async getOne(id) {
    if (isMock()) { await delay(); return MOCK_FACTURES.find((f) => f.id === id) ?? null }
    const { data } = await api.get(`/factures/${id}`)
    return data
  },

  async create(payload) {
    if (isMock()) {
      await delay(600)
      const now = new Date().toISOString().slice(0, 10)
      const f = {
        ...payload,
        id: ++mockIdSeq,
        numero: `FAC-2026-${String(mockIdSeq).padStart(3, '0')}`,
        statut: 'non_payee',
        date_emission: now,
        code_tracage: `GX-T-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        qr_code_url: null,
        dgi_pdf_url: null,
      }
      MOCK_FACTURES.push(f)
      return f
    }
    const { data } = await api.post('/factures', payload)
    return data
  },

  async updateStatut(id, statut, acompte = null) {
    if (isMock()) {
      await delay()
      const f = MOCK_FACTURES.find((x) => x.id === id)
      if (f) { f.statut = statut; if (acompte != null) f.acompte = acompte }
      return f
    }
    const { data } = await api.patch(`/factures/${id}/statut`, { statut, acompte })
    return data
  },

  async uploadDgi(id, fichier) {
    if (isMock()) {
      await delay(800)
      const f = MOCK_FACTURES.find((x) => x.id === id)
      if (f) f.dgi_pdf_url = URL.createObjectURL(fichier)
      return f
    }
    const form = new FormData()
    form.append('fichier', fichier)
    const { data } = await api.post(`/factures/${id}/dgi`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return data
  },

  async delete(id) {
    if (isMock()) {
      await delay()
      const idx = MOCK_FACTURES.findIndex((x) => x.id === id)
      if (idx !== -1) MOCK_FACTURES.splice(idx, 1)
      return
    }
    await api.delete(`/factures/${id}`)
  },
}
