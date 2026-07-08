import { Model } from '@nozbe/watermelondb'

export default class CommandeItem extends Model {
  static table = 'commande_items'
  static associations = {
    commandes: { type: 'belongs_to', key: 'commande_id' },
  }

  get commande_id()   { return this._getRaw('commande_id')   ?? '' }
  set commande_id(v)  { this._setRaw('commande_id', v) }

  get vetement_id()   { return this._getRaw('vetement_id')   ?? null }
  set vetement_id(v)  { this._setRaw('vetement_id', v) }

  get vetement_nom()  { return this._getRaw('vetement_nom')  ?? '' }
  set vetement_nom(v) { this._setRaw('vetement_nom', v) }

  get quantite()      { return this._getRaw('quantite')      ?? 1 }
  set quantite(v)     { this._setRaw('quantite', Number(v)) }

  get prix_unitaire() { return this._getRaw('prix_unitaire') ?? 0 }
  set prix_unitaire(v){ this._setRaw('prix_unitaire', Number(v)) }

  get description()   { return this._getRaw('description')   ?? '' }
  set description(v)  { this._setRaw('description', v) }

  get synced_at()     { return this._getRaw('synced_at')     ?? null }
  set synced_at(v)    { this._setRaw('synced_at', v) }
}
