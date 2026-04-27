import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockAtelier } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const abonnementService = {
  async getCurrent() {
    if (isMock()) {
      await delay()
      return mockAtelier.abonnement
    }
    const { data } = await api.get('/abonnement/current')
    return data
  },

  async getPlans() {
    if (isMock()) {
      await delay()
      return [
        {
          cle: 'standard_mensuel', label: 'Standard Mensuel', duree_jours: 31, prix_xof: 3500,
          description_courte: 'Idéal pour démarrer',
          config: { max_assistants: 0, max_membres: 0, max_clients_par_mois: 50, max_photos_vip_par_mois: null, max_factures_par_mois: 0, pts_par_client: 1, pts_par_commande: 1, seuil_conversion_pts: 10000, photos_vip: false, facture_whatsapp: false, rappels_whatsapp_auto: true, sauvegarde_auto: false, module_caisse: false, multi_ateliers: false, export_pdf: true },
        },
        {
          cle: 'standard_annuel', label: 'Standard Annuel', duree_jours: 365, prix_xof: 35000,
          description_courte: "Économisez avec l'annuel",
          config: { max_assistants: 1, max_membres: 1, max_clients_par_mois: 80, max_photos_vip_par_mois: null, max_factures_par_mois: 0, pts_par_client: 1, pts_par_commande: 1, seuil_conversion_pts: 10000, photos_vip: false, facture_whatsapp: false, rappels_whatsapp_auto: true, sauvegarde_auto: false, module_caisse: false, multi_ateliers: false, export_pdf: true },
        },
        {
          cle: 'premium_mensuel', label: 'Premium Mensuel', duree_jours: 31, prix_xof: 7500,
          description_courte: 'Le plus populaire',
          config: { max_assistants: 1, max_membres: 3, max_clients_par_mois: 100, max_photos_vip_par_mois: 5, max_factures_par_mois: 25, pts_par_client: 1, pts_par_commande: 1, seuil_conversion_pts: 45000, photos_vip: true, facture_whatsapp: true, rappels_whatsapp_auto: true, sauvegarde_auto: false, module_caisse: true, multi_ateliers: false, export_pdf: true },
        },
        {
          cle: 'premium_annuel', label: 'Premium Annuel', duree_jours: 365, prix_xof: 75000,
          description_courte: 'Premium avec sauvegarde auto',
          config: { max_assistants: 2, max_membres: 5, max_clients_par_mois: 150, max_photos_vip_par_mois: 15, max_factures_par_mois: null, pts_par_client: 2, pts_par_commande: 2, seuil_conversion_pts: 45000, photos_vip: true, facture_whatsapp: true, rappels_whatsapp_auto: true, sauvegarde_auto: true, module_caisse: true, multi_ateliers: false, export_pdf: true },
        },
        {
          cle: 'magnat_mensuel', label: 'Magnat Mensuel', duree_jours: 31, prix_xof: 15000,
          description_courte: 'Pour les grands ateliers',
          config: { max_assistants: 2, max_membres: 5, max_clients_par_mois: 300, max_photos_vip_par_mois: 15, max_factures_par_mois: 50, pts_par_client: 2, pts_par_commande: 2, seuil_conversion_pts: 100000, photos_vip: true, facture_whatsapp: true, rappels_whatsapp_auto: true, sauvegarde_auto: true, module_caisse: true, multi_ateliers: false, export_pdf: true },
        },
        {
          cle: 'magnat_annuel', label: 'Magnat Annuel', duree_jours: 365, prix_xof: 150000,
          description_courte: 'Performance maximale',
          config: { max_assistants: 3, max_membres: 7, max_clients_par_mois: 500, max_photos_vip_par_mois: 25, max_factures_par_mois: null, pts_par_client: 3, pts_par_commande: 3, seuil_conversion_pts: 100000, photos_vip: true, facture_whatsapp: true, rappels_whatsapp_auto: true, sauvegarde_auto: true, module_caisse: true, multi_ateliers: false, export_pdf: true },
        },
      ]
    }
    const { data } = await api.get('/abonnement/plans')
    return data
  },

  // Lance un paiement d'abonnement via FedaPay
  // payload: { niveau_cle: 'standard_mensuel', provider?: 'fedapay' }
  async initierPaiement(niveau_cle, provider = 'fedapay') {
    if (isMock()) {
      await delay(800)
      return { checkout_url: '#mock-payment', paiement_id: 'mock-' + Date.now() }
    }
    const { data } = await api.post('/paiements/initier', { niveau_cle, provider })
    return data
  },

  // Vérifie le statut d'un paiement d'abonnement
  async statusPaiement(paiementId) {
    if (isMock()) {
      await delay()
      return { paiement_id: paiementId, statut: 'valide' }
    }
    const { data } = await api.get(`/paiements/${paiementId}/status`)
    return data
  },

  async activateCode(code) {
    if (isMock()) {
      await delay()
      if (code === 'PROMO-2026') {
        mockAtelier.abonnement.niveau_cle = 'standard_mensuel'
        return mockAtelier.abonnement
      }
      throw { code: 'code_invalide' }
    }
    const { data } = await api.post('/abonnement/activer-code', { code })
    return data
  },
}
