import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockClients, mockAtelier } from './mockData'

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms))

export const whatsappService = {
  async getRappelClient(clientId) {
    if (isMock()) {
      await delay()
      const client = mockClients.find(c => c.id === clientId)
      if (!client?.telephone) throw { code: 'no_phone', message: 'Ce client n\'a pas de numéro de téléphone.' }
      const phone = client.telephone.replace(/\D/g, '')
      const message = `Bonjour ${client.prenom}, nous vous contactons depuis ${mockAtelier.nom}. Votre commande est en cours de préparation. Merci de nous confirmer votre disponibilité pour la livraison.`
      const lien = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      return { lien, message }
    }
    const { data } = await api.get(`/whatsapp/rappel-client/${clientId}`)
    return data
  },
}
