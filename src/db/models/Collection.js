import { Model } from '@nozbe/watermelondb'

export default class Collection extends Model {
  static table = 'collections'

  get nom()        { return this._getRaw('nom')        ?? '' }
  set nom(v)       { this._setRaw('nom', v) }

  get atelier_id() { return this._getRaw('atelier_id') ?? '' }
  set atelier_id(v){ this._setRaw('atelier_id', v) }

  get synced_at()  { return this._getRaw('synced_at')  ?? null }
  set synced_at(v) { this._setRaw('synced_at', v) }
}
