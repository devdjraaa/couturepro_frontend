import { Model } from '@nozbe/watermelondb'

export default class Commande extends Model {
  static table = 'commandes'
  static associations = {
    clients:  { type: 'belongs_to', key: 'client_id' },
    vetements: { type: 'belongs_to', key: 'vetement_id' },
  }

  get client_id()                { return this._getRaw('client_id')                ?? '' }
  set client_id(v)               { this._setRaw('client_id', v) }

  get vetement_id()              { return this._getRaw('vetement_id')              ?? null }
  set vetement_id(v)             { this._setRaw('vetement_id', v) }

  get client_nom()               { return this._getRaw('client_nom')               ?? '' }
  set client_nom(v)              { this._setRaw('client_nom', v) }

  get vetement_nom()             { return this._getRaw('vetement_nom')             ?? '' }
  set vetement_nom(v)            { this._setRaw('vetement_nom', v) }

  get quantite()                 { return this._getRaw('quantite')                 ?? 1 }
  set quantite(v)                { this._setRaw('quantite', Number(v)) }

  get prix()                     { return this._getRaw('prix')                     ?? 0 }
  set prix(v)                    { this._setRaw('prix', Number(v)) }

  get acompte()                  { return this._getRaw('acompte')                  ?? 0 }
  set acompte(v)                 { this._setRaw('acompte', Number(v)) }

  get mode_paiement_acompte()    { return this._getRaw('mode_paiement_acompte')    ?? null }
  set mode_paiement_acompte(v)   { this._setRaw('mode_paiement_acompte', v) }

  get statut()                   { return this._getRaw('statut')                   ?? 'en_cours' }
  set statut(v)                  { this._setRaw('statut', v) }

  get description()              { return this._getRaw('description')              ?? '' }
  set description(v)             { this._setRaw('description', v) }

  get note_interne()             { return this._getRaw('note_interne')             ?? '' }
  set note_interne(v)            { this._setRaw('note_interne', v) }

  get date_livraison_prevue()    { return this._getRaw('date_livraison_prevue')    ?? null }
  set date_livraison_prevue(v)   { this._setRaw('date_livraison_prevue', v) }

  get date_livraison_effective() { return this._getRaw('date_livraison_effective') ?? null }
  set date_livraison_effective(v){ this._setRaw('date_livraison_effective', v) }

  get urgence()                  { return this._getRaw('urgence')                  ?? false }
  set urgence(v)                 { this._setRaw('urgence', Boolean(v)) }

  get is_archived()              { return this._getRaw('is_archived')              ?? false }
  set is_archived(v)             { this._setRaw('is_archived', Boolean(v)) }

  get rappel_j2_envoye()         { return this._getRaw('rappel_j2_envoye')         ?? false }
  set rappel_j2_envoye(v)        { this._setRaw('rappel_j2_envoye', Boolean(v)) }

  get photo_tissu_url()          { return this._getRaw('photo_tissu_url')          ?? null }
  set photo_tissu_url(v)         { this._setRaw('photo_tissu_url', v) }

  get atelier_id()               { return this._getRaw('atelier_id')               ?? '' }
  set atelier_id(v)              { this._setRaw('atelier_id', v) }

  get synced_at()                { return this._getRaw('synced_at')                ?? null }
  set synced_at(v)               { this._setRaw('synced_at', v) }

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
