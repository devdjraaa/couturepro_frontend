/**
 * CLI-3 — Compte à rebours de lancement.
 *
 * La logique de décompte est isolée du rendu parce qu'elle sert DEUX écrans qui
 * n'ont rien en commun visuellement : une bande discrète en haut de page à
 * partir de J-30, et un chrono plein écran le jour J. Les deux lisent le même
 * réglage serveur et la même horloge ; seul l'habillage change.
 *
 * Le réglage vient de `GET /vitrine/compte-a-rebours` (éditable en admin) : ni
 * la date, ni les textes, ni la couleur ne sont figés ici. Ce compte à rebours
 * servira au lancement du 22 août, puis à d'autres annonces — une date en dur
 * aurait imposé un redéploiement à chaque réutilisation.
 */
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/constants/config'

const INACTIF = { actif: false }

// Une seconde : le chrono du jour J descend jusqu'aux secondes.
const PAS_MS = 1000

let cache = null

export async function chargerCompteRebours() {
  if (cache) return cache
  try {
    const r = await fetch(`${API_BASE_URL}/vitrine/compte-a-rebours`, { headers: { Accept: 'application/json' } })
    cache = r.ok ? await r.json() : INACTIF
  } catch {
    // Serveur injoignable : rien ne s'affiche. Un compte à rebours est un
    // ornement — il ne doit jamais dégrader la page qui l'accueille.
    cache = INACTIF
  }

  return cache
}

// Cotonou est à UTC+1 toute l'année (pas d'heure d'été).
const DECALAGE_COTONOU_MS = 3600 * 1000

/** Date calendaire à Cotonou, au format AAAA-MM-JJ. */
function jourCotonou(ms) {
  return new Date(ms + DECALAGE_COTONOU_MS).toISOString().slice(0, 10)
}

/**
 * Jours restants comptés en JOURS CALENDAIRES, pas en tranches de 24 h.
 *
 * La différence n'est pas cosmétique : à 23 h de l'échéance, un calcul en
 * `floor(ms / 86400)` renvoie 0 et déclenche donc le chrono « jour J » la
 * VEILLE au soir — un plein écran affiché un jour entier trop tôt. Et le texte
 * de la bande annoncerait « plus que 0 jour » alors qu'on est encore la veille.
 */
export function joursCalendaires(cible, maintenant) {
  const a = Date.parse(`${jourCotonou(maintenant)}T00:00:00Z`)
  const b = Date.parse(`${jourCotonou(cible)}T00:00:00Z`)

  return Math.round((b - a) / 86400000)
}

/**
 * Découpe un écart en millisecondes en unités d'affichage.
 * `total` est conservé : c'est lui qui permet de distinguer « échéance passée »
 * d'un décompte à zéro pile.
 */
export function decouper(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))

  return {
    total: ms,
    jours: Math.floor(s / 86400),
    heures: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    secondes: s % 60,
  }
}

/**
 * Interprète la date du réglage comme une heure de Cotonou (UTC+1), pas comme
 * l'heure locale du visiteur : le lancement a lieu à un instant unique, pas à
 * 8 h dans chaque fuseau. Sans cela, un visiteur à Paris verrait le chrono
 * tomber à zéro une heure trop tôt.
 */
export function versInstant(dateCible) {
  if (!dateCible) return null
  const d = new Date(`${String(dateCible).replace(' ', 'T')}:00+01:00`)

  return Number.isNaN(d.getTime()) ? null : d.getTime()
}

/**
 * État complet du compte à rebours, réévalué chaque seconde.
 *
 * `phase` vaut :
 *  - `null`    : rien à afficher (inactif, mal configuré, ou trop tôt) ;
 *  - `bande`   : dans la fenêtre d'approche, avant le jour J ;
 *  - `jour_j`  : le jour de l'échéance, avant qu'elle ne tombe ;
 *  - `passe`   : échéance dépassée — la bande se masque d'elle-même, sans
 *                qu'on ait à repasser en admin pour l'éteindre.
 */
export function useCompteRebours() {
  const [cfg, setCfg] = useState(cache ?? INACTIF)
  const [maintenant, setMaintenant] = useState(() => Date.now())

  useEffect(() => {
    let vivant = true
    chargerCompteRebours().then((c) => { if (vivant) setCfg(c) })

    return () => { vivant = false }
  }, [])

  const cible = cfg?.actif ? versInstant(cfg.date_cible) : null

  useEffect(() => {
    if (!cible) return undefined
    const id = setInterval(() => setMaintenant(Date.now()), PAS_MS)

    return () => clearInterval(id)
  }, [cible])

  if (!cible) return { phase: null, cfg, reste: decouper(0) }

  // `jours` est écrasé par le compte calendaire : c'est lui qu'on affiche dans
  // la bande (« plus que 3 jours ») et qui décide de la phase. Les heures,
  // minutes et secondes restent le vrai écart, pour le chrono du jour J.
  const jours = joursCalendaires(cible, maintenant)
  const reste = { ...decouper(cible - maintenant), jours }
  const seuil = Number(cfg.jours_avant) || 30

  let phase = null
  if (reste.total <= 0) phase = 'passe'
  else if (jours <= 0) phase = 'jour_j'
  else if (jours <= seuil) phase = 'bande'

  return { phase, cfg, reste }
}

/**
 * Remplit les marqueurs `{{jours}}`, `{{heures}}`… d'un texte admin.
 * Les textes sont saisis en clair par la direction : elle doit pouvoir écrire
 * « Plus que {{jours}} jours » sans connaître le code.
 */
export function remplir(gabarit, reste) {
  return String(gabarit ?? '').replace(/\{\{(\w+)\}\}/g, (m, cle) =>
    (cle in reste ? String(reste[cle]) : m))
}
