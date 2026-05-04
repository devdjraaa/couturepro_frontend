import { Model } from '@nozbe/watermelondb'
import { Q } from '@nozbe/watermelondb'

export default class Vetement extends Model {
  static table = 'vetements'
  static associations = {
    commandes: { type: 'has_many', foreignKey: 'vetement_id' },
    mesures:   { type: 'has_many', foreignKey: 'vetement_id' },
  }

  get nom()                   { return this._getRaw('nom')                   ?? '' }
  set nom(v)                  { this._setRaw('nom', v) }

  get categorie()             { return this._getRaw('categorie')             ?? '' }
  set categorie(v)            { this._setRaw('categorie', v) }

  get description()           { return this._getRaw('description')           ?? '' }
  set description(v)          { this._setRaw('description', v) }

  get libelles_mesures_json() { return this._getRaw('libelles_mesures_json') ?? '[]' }
  set libelles_mesures_json(v){ this._setRaw('libelles_mesures_json', v) }

  get images_json()           { return this._getRaw('images_json')           ?? '[]' }
  set images_json(v)          { this._setRaw('images_json', v) }

  get image_url()             { return this._getRaw('image_url')             ?? '' }
  set image_url(v)            { this._setRaw('image_url', v) }

  get est_gabarit()           { return this._getRaw('est_gabarit')           ?? false }
  set est_gabarit(v)          { this._setRaw('est_gabarit', Boolean(v)) }

  get is_systeme()            { return this._getRaw('is_systeme')            ?? false }
  set is_systeme(v)           { this._setRaw('is_systeme', Boolean(v)) }

  get is_archived()           { return this._getRaw('is_archived')           ?? false }
  set is_archived(v)          { this._setRaw('is_archived', Boolean(v)) }

  get template_numero()       { return this._getRaw('template_numero')       ?? null }
  set template_numero(v)      { this._setRaw('template_numero', v) }

  get atelier_id()            { return this._getRaw('atelier_id')            ?? '' }
  set atelier_id(v)           { this._setRaw('atelier_id', v) }

  get synced_at()             { return this._getRaw('synced_at')             ?? null }
  set synced_at(v)            { this._setRaw('synced_at', v) }

  get libelles_mesures() {
    try { return JSON.parse(this.libelles_mesures_json) } catch { return [] }
  }

  get images() {
    try { return JSON.parse(this.images_json) } catch { return [] }
  }

  get commandes() {
    return this.collections.get('commandes').query(Q.where('vetement_id', this.id))
  }

  get mesures() {
    return this.collections.get('mesures').query(Q.where('vetement_id', this.id))
  }
}
