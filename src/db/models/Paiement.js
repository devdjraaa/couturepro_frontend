import { Model } from '@nozbe/watermelondb'

export default class Paiement extends Model {
  static table = 'paiements'
  static associations = {
    commandes: { type: 'belongs_to', key: 'commande_id' },
  }

  get commande_id()    { return this._getRaw('commande_id')    ?? '' }
  set commande_id(v)   { this._setRaw('commande_id', v) }

  get atelier_id()     { return this._getRaw('atelier_id')     ?? '' }
  set atelier_id(v)    { this._setRaw('atelier_id', v) }

  get montant()        { return this._getRaw('montant')        ?? 0 }
  set montant(v)       { this._setRaw('montant', Number(v)) }

  get mode_paiement()  { return this._getRaw('mode_paiement')  ?? 'especes' }
  set mode_paiement(v) { this._setRaw('mode_paiement', v) }

  get enregistre_par() { return this._getRaw('enregistre_par') ?? '' }
  set enregistre_par(v){ this._setRaw('enregistre_par', v) }

  get date_paiement()  { return this._getRaw('date_paiement')  ?? null }
  set date_paiement(v) { this._setRaw('date_paiement', v) }

  get synced_at()      { return this._getRaw('synced_at')      ?? null }
  set synced_at(v)     { this._setRaw('synced_at', v) }
}
