import api from './api'

export const commandeGroupeService = {
  async getAll() {
    const { data } = await api.get('/commande-groupes')
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/commande-groupes/${id}`)
    return data
  },

  async create(payload) {
    // P24 : si au moins un article a une photo de tissu (File), on passe en multipart.
    const hasFiles = payload.sous_commandes?.some(sc => sc.photo_tissu instanceof File)
    if (!hasFiles) {
      const { data } = await api.post('/commande-groupes', payload)
      return data
    }

    const fd = new FormData()
    fd.append('client_id', payload.client_id)
    if (payload.note) fd.append('note', payload.note)
    payload.sous_commandes.forEach((sc, i) => {
      const base = `sous_commandes[${i}]`
      fd.append(`${base}[vetement_id]`, sc.vetement_id)
      fd.append(`${base}[quantite]`, sc.quantite ?? 1)
      fd.append(`${base}[prix]`, sc.prix)
      if (sc.acompte) fd.append(`${base}[acompte]`, sc.acompte)
      if (sc.mode_paiement_acompte) fd.append(`${base}[mode_paiement_acompte]`, sc.mode_paiement_acompte)
      if (sc.date_livraison_prevue) fd.append(`${base}[date_livraison_prevue]`, sc.date_livraison_prevue)
      if (sc.description) fd.append(`${base}[description]`, sc.description)
      fd.append(`${base}[urgence]`, sc.urgence ? 1 : 0)   // multipart : booléen → 1/0 (la règle boolean refuse 'true')
      if (sc.photo_tissu instanceof File) fd.append(`${base}[photo_tissu]`, sc.photo_tissu)
    })
    const { data } = await api.post('/commande-groupes', fd)
    return data
  },
}
