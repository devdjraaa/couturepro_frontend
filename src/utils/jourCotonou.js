// Jour calendaire à Cotonou (Bénin), au format AAAA-MM-JJ.
//
// Le backend raisonne en heure de Cotonou (UTC+1, pas d'heure d'été). Tout ce
// qui se compare à « aujourd'hui » côté serveur — fenêtre de Boost, échéances —
// doit utiliser CE jour, pas le jour UTC de `toISOString()`. Sinon, entre
// minuit UTC et minuit Cotonou, le front propose la veille et le serveur refuse.
const DECALAGE_COTONOU_MS = 3600 * 1000

export function jourCotonou(ms = Date.now()) {
  return new Date(ms + DECALAGE_COTONOU_MS).toISOString().slice(0, 10)
}
