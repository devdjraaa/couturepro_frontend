import { Model } from '@nozbe/watermelondb'

/**
 * REL-3 — Cache hors ligne de « Mes Réalisations ».
 *
 * Lecture seule. Créer une réalisation demande d'envoyer des photos, ce qui
 * suppose une file de fichiers à téléverser — un chantier distinct. Ce cache
 * répond au besoin réel : consulter ses brouillons et ses dossiers en attente
 * de validation sans réseau, ce qui arrive constamment en atelier.
 *
 * Les images sont stockées en JSON plutôt qu'en table liée : elles ne sont
 * jamais interrogées séparément, et une table de plus alourdirait la synchro
 * pour rien. `images` fait la conversion aux frontières, pour que l'écran
 * manipule la même forme qu'en ligne.
 */
export default class Realisation extends Model {
  static table = 'realisations'

  get titre()         { return this._getRaw('titre')        ?? '' }
  set titre(v)        { this._setRaw('titre', v) }

  get description()   { return this._getRaw('description')  ?? '' }
  set description(v)  { this._setRaw('description', v) }

  get statut()        { return this._getRaw('statut')       ?? 'brouillon' }
  set statut(v)       { this._setRaw('statut', v) }

  get motif_refus()   { return this._getRaw('motif_refus')  ?? null }
  set motif_refus(v)  { this._setRaw('motif_refus', v) }

  get soumis_at()     { return this._getRaw('soumis_at')    ?? null }
  set soumis_at(v)    { this._setRaw('soumis_at', v) }

  get publie_at()     { return this._getRaw('publie_at')    ?? null }
  set publie_at(v)    { this._setRaw('publie_at', v) }

  get date_creation() { return this._getRaw('date_creation') ?? null }
  set date_creation(v){ this._setRaw('date_creation', v) }

  get atelier_id()    { return this._getRaw('atelier_id')   ?? '' }
  set atelier_id(v)   { this._setRaw('atelier_id', v) }

  get synced_at()     { return this._getRaw('synced_at')    ?? null }
  set synced_at(v)    { this._setRaw('synced_at', v) }

  /**
   * Images sous la forme attendue par l'écran. Un JSON corrompu rend une liste
   * vide plutôt que de faire planter la page : une vignette manquante est un
   * moindre mal comparé à un écran blanc.
   */
  get images() {
    try {
      const brut = this._getRaw('images_json')

      return brut ? JSON.parse(brut) : []
    } catch {
      return []
    }
  }

  set images(v) {
    this._setRaw('images_json', JSON.stringify(Array.isArray(v) ? v : []))
  }
}
