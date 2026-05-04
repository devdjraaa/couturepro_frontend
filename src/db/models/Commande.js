import { Model } from '@nozbe/watermelondb'
import { field, text, relation } from '@nozbe/watermelondb/decorators'

export default class Commande extends Model {
  static table = 'commandes'
  static associations = {
    clients:  { type: 'belongs_to', key: 'client_id' },
    vetements: { type: 'belongs_to', key: 'vetement_id' },
  }

  @text('client_id')                client_id
  @text('vetement_id')              vetement_id
  @text('client_nom')               client_nom
  @text('vetement_nom')             vetement_nom
  @field('quantite')                quantite
  @field('prix')                    prix
  @field('acompte')                 acompte
  @text('mode_paiement_acompte')    mode_paiement_acompte
  @text('statut')                   statut
  @text('description')              description
  @text('note_interne')             note_interne
  @text('date_livraison_prevue')    date_livraison_prevue
  @text('date_livraison_effective') date_livraison_effective
  @field('urgence')                 urgence
  @field('is_archived')             is_archived
  @field('rappel_j2_envoye')        rappel_j2_envoye
  @text('photo_tissu_url')          photo_tissu_url
  @text('atelier_id')               atelier_id
  @field('synced_at')               synced_at

  @relation('clients', 'client_id')   client
  @relation('vetements', 'vetement_id') vetement

  get isLate() {
    return this.date_livraison_prevue
      && new Date(this.date_livraison_prevue) < new Date()
      && this.statut === 'en_cours'
  }

  get isIn48h() {
    if (!this.date_livraison_prevue || this.statut !== 'en_cours') return false
    const diff = new Date(this.date_livraison_prevue) - new Date()
    return diff > 0 && diff <= 48 * 3_600_000
  }
}
