import { Model } from '@nozbe/watermelondb'
import { field, text, children, readonly, date } from '@nozbe/watermelondb/decorators'

export default class Client extends Model {
  static table = 'clients'
  static associations = {
    commandes: { type: 'has_many', foreignKey: 'client_id' },
    mesures:   { type: 'has_many', foreignKey: 'client_id' },
  }

  @text('nom')          nom
  @text('prenom')       prenom
  @text('telephone')    telephone
  @text('type_profil')  type_profil
  @field('avatar_index') avatar_index
  @field('is_vip')      is_vip
  @field('is_archived') is_archived
  @text('notes')        notes
  @text('atelier_id')   atelier_id
  @text('created_by')   created_by
  @field('synced_at')   synced_at

  @children('commandes') commandes
  @children('mesures')   mesures

  get nomComplet() {
    return [this.prenom, this.nom].filter(Boolean).join(' ')
  }
}
