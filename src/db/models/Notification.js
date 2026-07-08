import { Model } from '@nozbe/watermelondb'

export default class Notification extends Model {
  static table = 'notifications'

  get titre()         { return this._getRaw('titre')         ?? '' }
  set titre(v)        { this._setRaw('titre', v) }

  get contenu()       { return this._getRaw('contenu')       ?? '' }
  set contenu(v)      { this._setRaw('contenu', v) }

  get type()          { return this._getRaw('type')          ?? 'info' }
  set type(v)         { this._setRaw('type', v) }

  get is_read()       { return this._getRaw('is_read')       ?? false }
  set is_read(v)      { this._setRaw('is_read', Boolean(v)) }

  get atelier_id()    { return this._getRaw('atelier_id')    ?? '' }
  set atelier_id(v)   { this._setRaw('atelier_id', v) }

  get date_creation() { return this._getRaw('date_creation') ?? null }
  set date_creation(v){ this._setRaw('date_creation', v) }

  get synced_at()     { return this._getRaw('synced_at')     ?? null }
  set synced_at(v)    { this._setRaw('synced_at', v) }
}
