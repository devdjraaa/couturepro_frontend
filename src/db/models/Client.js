import { Model } from '@nozbe/watermelondb'
import { Q } from '@nozbe/watermelondb'

export default class Client extends Model {
  static table = 'clients'
  static associations = {
    commandes: { type: 'has_many', foreignKey: 'client_id' },
    mesures:   { type: 'has_many', foreignKey: 'client_id' },
  }

  get nom()          { return this._getRaw('nom')          ?? '' }
  set nom(v)         { this._setRaw('nom', v) }

  get prenom()       { return this._getRaw('prenom')       ?? '' }
  set prenom(v)      { this._setRaw('prenom', v) }

  get telephone()    { return this._getRaw('telephone')    ?? '' }
  set telephone(v)   { this._setRaw('telephone', v) }

  get type_profil()  { return this._getRaw('type_profil')  ?? 'mixte' }
  set type_profil(v) { this._setRaw('type_profil', v) }

  get avatar_index() { return this._getRaw('avatar_index') ?? null }
  set avatar_index(v){ this._setRaw('avatar_index', v) }

  get is_vip()       { return this._getRaw('is_vip')       ?? false }
  set is_vip(v)      { this._setRaw('is_vip', Boolean(v)) }

  get is_archived()  { return this._getRaw('is_archived')  ?? false }
  set is_archived(v) { this._setRaw('is_archived', Boolean(v)) }

  get notes()        { return this._getRaw('notes')        ?? '' }
  set notes(v)       { this._setRaw('notes', v) }

  get atelier_id()   { return this._getRaw('atelier_id')   ?? '' }
  set atelier_id(v)  { this._setRaw('atelier_id', v) }

  get created_by()   { return this._getRaw('created_by')   ?? '' }
  set created_by(v)  { this._setRaw('created_by', v) }

  get synced_at()    { return this._getRaw('synced_at')    ?? null }
  set synced_at(v)   { this._setRaw('synced_at', v) }

  get nomComplet() {
    return [this.prenom, this.nom].filter(Boolean).join(' ')
  }

  get commandes() {
    return this.collections.get('commandes').query(Q.where('client_id', this.id))
  }

  get mesures() {
    return this.collections.get('mesures').query(Q.where('client_id', this.id))
  }
}
