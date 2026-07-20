import { T, enTete, encart, esc } from './pdfTheme'
import { rendrePdf, nomFichier } from './pdfRendu'

/**
 * Lookbook — V2 (refonte du 20/07).
 *
 * Book partageable d'une collection. Le seul des sept documents où l'image
 * prime : grille en ratio portrait 3/4 (proportion d'une pièce portée), légende
 * en Bodoni sous chaque visuel.
 */
export async function exportLookbookPdf({ atelierNom = 'Gextimo', titre = 'Lookbook', creations = [] }) {
  if (creations.length === 0) return

  const format = (v) => (v ? new Intl.NumberFormat('fr-FR').format(Number(v)) + ' F' : 'Sur devis')

  const cartes = creations.map((c) => {
    const nom = c.nom ?? c.titre ?? ''
    const visuel = c.image_url
      ? `<img src="${esc(c.image_url)}" crossorigin="anonymous"
              style="width:100%;height:100%;object-fit:cover;display:block;" />`
      : `<div style="width:100%;height:100%;background:linear-gradient(140deg,${T.orPale},${T.fondDoux});"></div>`

    return `
      <figure style="margin:0;break-inside:avoid;">
        <div style="aspect-ratio:3/4;border:1px solid ${T.filet};overflow:hidden;">${visuel}</div>
        <figcaption style="padding-top:9px;">
          <p style="margin:0;font:500 13px/1.25 ${T.serif};color:${T.encre};">${esc(nom)}</p>
          <p style="margin:3px 0 0;font:600 10.5px/1.2 ${T.sans};color:${T.orSombre};
                    font-variant-numeric:tabular-nums;">${esc(format(c.prix))}</p>
        </figcaption>
      </figure>`
  }).join('')

  const contenu =
    enTete({ atelierNom, titre, sousTitre: `${creations.length} pièce${creations.length > 1 ? 's' : ''}` }) +
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px 16px;">${cartes}</div>` +
    encart('', 'Pièces réalisées sur mesure. Prix indicatifs, délais à convenir directement avec l\'atelier.')

  return rendrePdf(contenu, nomFichier('lookbook', atelierNom, titre), {
    titre: `${titre} — ${atelierNom}`,
  })
}
