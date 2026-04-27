import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockClients, mockCommandes, mockAtelier } from './mockData'

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms))

function mockPhone(telephone) {
  return telephone.replace(/\D/g, '')
}

export const whatsappService = {
  async getRappelClient(clientId) {
    if (isMock()) {
      await delay()
      const client = mockClients.find(c => c.id === clientId)
      if (!client?.telephone) throw { code: 'no_phone', message: 'Ce client n\'a pas de numéro de téléphone.' }
      const phone = mockPhone(client.telephone)
      const message = `Bonjour ${client.prenom}, nous vous contactons depuis ${mockAtelier.nom}. Votre commande est en cours de préparation. Merci de nous confirmer votre disponibilité pour la livraison.`
      const lien = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      return { lien, message }
    }
    const { data } = await api.get(`/whatsapp/rappel-client/${clientId}`)
    return data
  },

  async getConfirmationCommande(commandeId) {
    if (isMock()) {
      await delay()
      const commande = mockCommandes.find(c => c.id === commandeId)
      const client = commande?.client ? mockClients.find(c => c.id === commande.client_id) : null
      if (!client?.telephone) throw { code: 'no_phone', message: 'Ce client n\'a pas de numéro de téléphone.' }
      const phone = mockPhone(client.telephone)
      const restant = Math.max(0, (commande.prix ?? 0) - (commande.acompte ?? 0))
      let message = `Bonjour ${client.prenom}, votre commande (${commande.vetement?.nom ?? ''}) a bien été enregistrée chez ${mockAtelier.nom}.`
      if (commande.acompte > 0) message += ` Acompte reçu : ${commande.acompte.toLocaleString('fr-FR')} FCFA.`
      if (restant > 0) message += ` Reste à payer : ${restant.toLocaleString('fr-FR')} FCFA.`
      message += ' Merci de votre confiance !'
      const lien = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      return { lien, message }
    }
    const { data } = await api.get(`/whatsapp/confirmation-commande/${commandeId}`)
    return data
  },

  async getCommandePrete(commandeId) {
    if (isMock()) {
      await delay()
      const commande = mockCommandes.find(c => c.id === commandeId)
      const client = commande?.client ? mockClients.find(c => c.id === commande.client_id) : null
      if (!client?.telephone) throw { code: 'no_phone', message: 'Ce client n\'a pas de numéro de téléphone.' }
      const phone = mockPhone(client.telephone)
      const restant = Math.max(0, (commande.prix ?? 0) - (commande.acompte ?? 0))
      let message = `Bonjour ${client.prenom}, votre commande (${commande.vetement?.nom ?? ''}) est prête chez ${mockAtelier.nom} !`
      if (restant > 0) message += ` Reste à payer : ${restant.toLocaleString('fr-FR')} FCFA.`
      else message += ' Tout a été réglé, venez récupérer votre commande.'
      const lien = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      return { lien, message }
    }
    const { data } = await api.get(`/whatsapp/commande-prete/${commandeId}`)
    return data
  },
}
