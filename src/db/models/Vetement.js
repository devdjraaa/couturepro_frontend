import { Model } from '@nozbe/watermelondb'
import { field, text, children } from '@nozbe/watermelondb/decorators'

export default class Vetement extends Model {
  static table = 'vetements'
  static associations = {
    commandes: { type: 'has_many', foreignKey: 'vetement_id' },
    mesures:   { type: 'has_many', foreignKey: 'vetement_id' },
  }

  @text('nom')                   nom
  @text('categorie')             categorie
  @text('description')           description
  @text('libelles_mesures_json') libelles_mesures_json
  @text('images_json')           images_json
  @text('image_url')             image_url
  @field('est_gabarit')          est_gabarit
  @field('is_systeme')           is_systeme
  @field('is_archived')          is_archived
  @field('template_numero')      template_numero
  @text('atelier_id')            atelier_id
  @field('synced_at')            synced_at

  @children('commandes') commandes
  @children('mesures')   mesures

  get libelles_mesures() {
    try { return JSON.parse(this.libelles_mesures_json) } catch { return [] }
  }

  get images() {
    try { return JSON.parse(this.images_json) } catch { return [] }
  }
}
