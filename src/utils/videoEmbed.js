/**
 * VID-1 — Reconnaissance d'un lien vidéo et lecture intégrée.
 *
 * Jusqu'ici un lien YouTube ouvrait YouTube : le visiteur quittait la vitrine
 * du créateur pour aller voir la vidéo ailleurs, et ne revenait pas forcément.
 *
 * L'ANALYSE DU LIEN est de la logique, pas de la façade : reconnaître le
 * fournisseur, en extraire l'identifiant, refuser proprement une URL qui n'est
 * pas une vidéo. L'apparence du lecteur, elle, reste au design.
 *
 * On accepte les formes réellement collées par les gens — pas seulement l'URL
 * canonique : lien de partage, lien court, Shorts, timestamp, paramètres de
 * suivi. Un créateur colle ce que son téléphone lui donne.
 */

const MOTIFS = [
  // youtube.com/watch?v=ID · youtu.be/ID · /embed/ID · /shorts/ID · /live/ID
  {
    fournisseur: 'youtube',
    test: /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i,
    embed: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
  },
  // vimeo.com/ID · player.vimeo.com/video/ID
  {
    fournisseur: 'vimeo',
    test: /vimeo\.com\/(?:video\/)?(\d{6,})/i,
    embed: (id) => `https://player.vimeo.com/video/${id}`,
  },
  // dailymotion.com/video/ID · dai.ly/ID
  {
    fournisseur: 'dailymotion',
    test: /(?:dailymotion\.com\/video\/|dai\.ly\/)([a-z0-9]+)/i,
    embed: (id) => `https://www.dailymotion.com/embed/video/${id}`,
  },
]

/**
 * @returns {{fournisseur: string, id: string, embed: string}|null}
 *   `null` = lien non reconnu ; l'appelant doit alors le traiter comme un lien
 *   sortant ordinaire plutôt que de tenter une intégration qui afficherait un
 *   cadre vide.
 */
export function analyserLienVideo(url) {
  const v = String(url ?? '').trim()
  if (!v) return null

  for (const m of MOTIFS) {
    const r = v.match(m.test)
    if (r?.[1]) {
      return { fournisseur: m.fournisseur, id: r[1], embed: m.embed(r[1]) }
    }
  }

  return null
}

/** Le lien pointe-t-il vers un fichier vidéo servi directement (import) ? */
export function estFichierVideo(url) {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(url ?? ''))
}
