import { Model } from '@nozbe/watermelondb'
import { field, text, relation } from '@nozbe/watermelondb/decorators'

export default class Mesure extends Model {
  static table = 'mesures'
  static associations = {
    clients:  { type: 'belongs_to', key: 'client_id' },
    vetements: { type: 'belongs_to', key: 'vetement_id' },
  }

  @text('client_id')   client_id
  @text('vetement_id') vetement_id
  @text('champs_json') champs_json
  @field('is_archived') is_archived
  @text('atelier_id')  atelier_id
  @field('synced_at')  synced_at

  @relation('clients', 'client_id')   client
  @relation('vetements', 'vetement_id') vetement

  get champs() {
    try { return JSON.parse(this.champs_json) } catch { return {} }
  }
}
