import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockMesures } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const mesureService = {
  async getByClient(clientId) {
    if (isMock()) {
      await delay()
      const m = mockMesures[clientId] ?? null
      return Array.isArray(m) ? (m[0] ?? null) : m
    }
    const { data } = await api.get(`/clients/${clientId}/mesures`)
    return data // single object or null
  },

  /**
   * Télécharge le CSV des mesures d'un client.
   *
   * On passe par le client axios (jeton `Authorization` joint), PAS par un
   * `<a href download>` : un lien de téléchargement classique n'envoie aucun
   * en-tête, et la route est protégée — le fichier serait remplacé par une
   * réponse 401. Le défaut ne se voyait pas au build : `href` recevait même une
   * Promise (méthode `async`), soit `[object Promise]`.
   *
   * Réponse binaire (`blob`) : le serveur ajoute un BOM UTF-8 pour qu'Excel lise
   * les accents. La rajouter ici le doublerait.
   */
  async telechargerCsv(clientId) {
    const { data, headers } = await api.get(`/clients/${clientId}/mesures/export-csv`, {
      responseType: 'blob',
    })
    const nom = (headers['content-disposition'] || '').match(/filename="?([^"]+)"?/)?.[1]
      || `mesures_${clientId}.csv`
    const url = URL.createObjectURL(data)
    const a = Object.assign(document.createElement('a'), { href: url, download: nom })
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
  },

  async getWhatsAppLink(clientId) {
    const { data } = await api.get(`/clients/${clientId}/mesures/whatsapp`)
    return data // { lien, message }
  },

  // P74 : historique versionné des mesures (en ligne uniquement — lecture seule).
  // PL-2 : export groupé des mesures (plans payants) — toutes les clientes en une fois.
  async exportGroupe() {
    const { data } = await api.get('/mesures/export-groupe')
    return data
  },

  async getHistorique(clientId) {
    if (isMock()) {
      await delay()
      return []
    }
    const { data } = await api.get(`/clients/${clientId}/mesures/historique`)
    return data // [{ id, version, champs, date, atelier, auteur, auteur_role }]
  },

  async save(clientId, champs) {
    if (isMock()) {
      await delay()
      const existing = mockMesures[clientId]
      const record = existing && !Array.isArray(existing) ? existing : { id: String(Date.now()), client_id: clientId }
      mockMesures[clientId] = { ...record, champs, updated_at: new Date().toISOString() }
      return mockMesures[clientId]
    }
    const { data } = await api.post('/mesures', { client_id: clientId, champs })
    return data
  },
}
