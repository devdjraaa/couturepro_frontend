import { Model } from '@nozbe/watermelondb'

export default class Mesure extends Model {
  static table = 'mesures'
  static associations = {
    clients:   { type: 'belongs_to', key: 'client_id' },
    vetements: { type: 'belongs_to', key: 'vetement_id' },
  }

  get client_id()   { return this._getRaw('client_id')   ?? '' }
  set client_id(v)  { this._setRaw('client_id', v) }

  get vetement_id() { return this._getRaw('vetement_id') ?? null }
  set vetement_id(v){ this._setRaw('vetement_id', v) }

  get champs_json() { return this._getRaw('champs_json') ?? '{}' }
  set champs_json(v){ this._setRaw('champs_json', v) }

  get is_archived() { return this._getRaw('is_archived') ?? false }
  set is_archived(v){ this._setRaw('is_archived', Boolean(v)) }

  get atelier_id()  { return this._getRaw('atelier_id')  ?? '' }
  set atelier_id(v) { this._setRaw('atelier_id', v) }

  get synced_at()   { return this._getRaw('synced_at')   ?? null }
  set synced_at(v)  { this._setRaw('synced_at', v) }

  get champs() {
    try { return JSON.parse(this.champs_json) } catch { return {} }
  }
}
