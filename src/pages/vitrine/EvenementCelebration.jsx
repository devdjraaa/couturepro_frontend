// Point 57 — Événements dynamiques (célébrations).
// Récupère les événements du jour (fêtes nationales/religieuses, interne Gextimo,
// anniversaire du client connecté, marketing) et affiche le plus prioritaire non
// encore vu. Deux modes : « splash » (overlay d'ouverture 3 s) et « toast »
// (discret, coin bas-gauche, refermable) — l'anniversaire est volontairement discret.
// Non-intrusif : 1×/jour (ou 1× à vie) par événement, hors ligne = rien.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Heart, Star } from 'lucide-react'
import { API_BASE_URL } from '@/constants/config'
import { getClientToken } from './espaceClientApi'

// Palette festive des confettis (charte + touches de fête).
const CONFETTIS = ['#C4162A', '#E8B923', '#1F7A5A', '#2563EB', '#EC4899', '#F97316']

/* Texte selon la langue, avec repli sur le français. */
function txt(champ, lang) {
  if (!champ) return ''
  return champ[lang] || champ.fr || champ.en || ''
}

/* Clé de mémorisation : quotidien = par jour, unique = à vie. */
function cleVu(evt) {
  const base = `gx_cel_${evt.code}`
  return evt.frequence_affichage === 'unique' ? base : `${base}_${new Date().toDateString()}`
}
function dejaVu(evt) {
  try { return !!localStorage.getItem(cleVu(evt)) } catch { return false }
}
function marquerVu(evt) {
  try { localStorage.setItem(cleVu(evt), '1') } catch { /* stockage indisponible : tant pis */ }
}

/* Couche de particules décoratives selon l'animation. */
function Particules({ animation, couleur }) {
  const parts = useMemo(() => {
    if (animation === 'aucune') return []
    const n = animation === 'coeurs' ? 16 : 24
    return Array.from({ length: n }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 2.4,
      dur: 3 + Math.random() * 2.8,
      size: 8 + Math.random() * 12,
      teinte: CONFETTIS[Math.floor(Math.random() * CONFETTIS.length)],
    }))
  }, [animation])

  if (!parts.length) return null

  return (
    <div className="gx-cel-layer" aria-hidden="true">
      {parts.map((p, i) => {
        const commun = {
          left: `${p.left}vw`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.dur}s`,
        }
        if (animation === 'coeurs') {
          return (
            <span key={i} className="gx-cel-part" style={{ ...commun, animationName: 'gx-cel-rise' }}>
              <Heart size={p.size + 6} fill={couleur} stroke={couleur} />
            </span>
          )
        }
        if (animation === 'etoiles') {
          return (
            <span key={i} className="gx-cel-part"
                  style={{ ...commun, animationName: 'gx-cel-fall, gx-cel-twinkle', animationDuration: `${p.dur}s, 1.4s`, animationIterationCount: '1, infinite' }}>
              <Star size={p.size + 4} fill={p.teinte} stroke={p.teinte} />
            </span>
          )
        }
        // confettis (défaut) et neige : petits éléments qui tombent.
        const estNeige = animation === 'neige'
        return (
          <span key={i}
                className={`gx-cel-part ${estNeige ? 'gx-cel-snow' : 'gx-cel-confetti'}`}
                style={{
                  ...commun,
                  animationName: 'gx-cel-fall',
                  width: `${estNeige ? p.size * 0.6 : p.size}px`,
                  height: `${estNeige ? p.size * 0.6 : p.size * 0.55}px`,
                  background: estNeige ? undefined : p.teinte,
                }} />
        )
      })}
    </div>
  )
}

export default function EvenementCelebration() {
  const { i18n } = useTranslation()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'fr'
  const [evt, setEvt] = useState(null)
  const [visible, setVisible] = useState(false)
  const timers = useRef([])

  useEffect(() => {
    let mort = false
    const token = getClientToken()
    fetch(`${API_BASE_URL}/vitrine/evenements`, {
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((r) => r.json())
      .then((d) => {
        if (mort) return
        const choisi = (d?.evenements || []).find((e) => !dejaVu(e))
        if (!choisi) return
        marquerVu(choisi)
        setEvt(choisi)
        setVisible(true)
        // Auto-fermeture : splash court, toast un peu plus long.
        const duree = choisi.mode_affichage === 'toast' ? 8000 : 3400
        timers.current.push(setTimeout(() => setVisible(false), duree))
        timers.current.push(setTimeout(() => setEvt(null), duree + 600))
      })
      .catch(() => { /* hors ligne / API injoignable : aucun overlay */ })
    return () => { mort = true; timers.current.forEach(clearTimeout) }
  }, [])

  if (!evt) return null

  const titre = txt(evt.titre, lang)
  const message = txt(evt.message, lang)
  const couleur = evt.couleur || '#C4162A'

  // Mode toast : discret, coin bas-gauche (n'empiète pas sur Makila à droite).
  if (evt.mode_affichage === 'toast') {
    return (
      <>
        <Particules animation={evt.animation} couleur={couleur} />
        <div role="status"
             className={'fixed bottom-4 left-4 z-[102] w-[min(88vw,320px)] bg-card border border-edge rounded-2xl shadow-2xl p-4 transition-all duration-500 ' +
               (visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none')}>
          <button onClick={() => setVisible(false)} aria-label="Fermer"
                  className="absolute top-2 right-2 p-1 rounded-lg text-ghost hover:text-ink transition"><X size={15} /></button>
          <div className="flex items-start gap-3">
            <span className="shrink-0 mt-0.5 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${couleur}1a`, color: couleur }}>
              <Heart size={18} fill={couleur} stroke={couleur} />
            </span>
            <div className="min-w-0">
              <p className="font-display font-bold text-[14px] text-ink leading-snug">{titre}</p>
              {message && <p className="text-[12.5px] text-dim leading-relaxed mt-0.5">{message}</p>}
            </div>
          </div>
        </div>
      </>
    )
  }

  // Mode splash : overlay d'ouverture centré, auto-disparition.
  return (
    <div aria-hidden="true"
         onClick={() => setVisible(false)}
         className={'fixed inset-0 z-[100] flex items-center justify-center bg-app/92 backdrop-blur-sm transition-opacity duration-500 ' +
           (visible ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <Particules animation={evt.animation} couleur={couleur} />
      <div className="relative z-[102] mx-6 max-w-md text-center px-8 py-9 rounded-3xl bg-card border shadow-2xl"
           style={{ borderColor: `${couleur}33` }}>
        {evt.image_url
          ? <img src={evt.image_url} alt="" className="mx-auto mb-4 max-w-[60vw] max-h-[32vh] object-contain rounded-2xl" />
          : <span className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${couleur}1a`, color: couleur }}>
              <Star size={26} fill={couleur} stroke={couleur} />
            </span>}
        <h2 className="font-display font-extrabold text-[clamp(20px,4vw,30px)] leading-tight" style={{ color: couleur }}>{titre}</h2>
        {message && <p className="mt-2.5 text-[14px] text-dim leading-relaxed">{message}</p>}
      </div>
    </div>
  )
}
