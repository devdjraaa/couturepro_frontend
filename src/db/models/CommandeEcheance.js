import { Model } from '@nozbe/watermelondb'

export default class CommandeEcheance extends Model {
  static table = 'commande_echeances'
  static associations = {
    commandes: { type: 'belongs_to', key: 'commande_id' },
  }

  get commande_id()   { return this._getRaw('commande_id')   ?? '' }
  set commande_id(v)  { this._setRaw('commande_id', v) }

  get date_echeance() { return this._getRaw('date_echeance') ?? null }
  set date_echeance(v){ this._setRaw('date_echeance', v) }

  get note()          { return this._getRaw('note')          ?? '' }
  set note(v)         { this._setRaw('note', v) }

  get livree()        { return this._getRaw('livree')        ?? false }
  set livree(v)       { this._setRaw('livree', Boolean(v)) }

  get livree_at()     { return this._getRaw('livree_at')     ?? null }
  set livree_at(v)    { this._setRaw('livree_at', v) }

  get synced_at()     { return this._getRaw('synced_at')     ?? null }
  set synced_at(v)    { this._setRaw('synced_at', v) }
}
