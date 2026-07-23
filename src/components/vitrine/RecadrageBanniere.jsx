import { useEffect, useRef, useState } from 'react'
import { X, Loader2, Check, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { positionDepuisCadrage } from './BanniereAtelier'

/**
 * VIT-3 — Choisir ce que la bannière montre.
 *
 * Jusqu'ici l'image était centrée d'office : un créateur dont le sujet est en
 * haut ou sur un côté le voyait coupé, sans recours. Il devait recadrer sa
 * photo dans une autre application avant de l'envoyer.
 *
 * Le cadre se déplace à la souris ou au doigt, et l'aperçu montre le rendu
 * RÉEL — même forme que la bande du profil public. Voir le résultat pendant
 * qu'on déplace vaut mieux que n'importe quelle explication.
 *
 * Ce qui est enregistré, ce sont des FRACTIONS de l'image (0 → 1), jamais des
 * pixels : la même bannière est servie à des tailles différentes selon
 * l'écran, et des pixels deviendraient faux dès la première miniature.
 */

// Forme de la bande publique. Le cadre garde ce rapport : proposer un cadre
// libre laisserait choisir une zone que la bande ne peut pas afficher telle
// quelle, et le créateur ne comprendrait pas l'écart entre son choix et le rendu.
const RAPPORT_BANDE = 3

const borner = (v, min, max) => Math.min(max, Math.max(min, v))

export default function RecadrageBanniere({ url, cadrageInitial, onEnregistrer, onFermer }) {
  const { t } = useTranslation()
  const T = (c) => t(`ma_vitrine.recadrage.${c}`)

  const boiteRef = useRef(null)
  const imgRef = useRef(null)
  const glisse = useRef(null)

  const [pret, setPret] = useState(false)
  const [cadre, setCadre] = useState(cadrageInitial || null)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState(null)

  /**
   * Cadre par défaut : la plus grande zone au rapport de la bande, centrée.
   * Calculé une fois l'image chargée — avant, on ignore ses proportions.
   */
  useEffect(() => {
    if (!pret || cadre) return

    const el = imgRef.current
    const rapportImage = el.naturalWidth / el.naturalHeight
    let largeur = 1
    let hauteur = rapportImage / RAPPORT_BANDE

    if (hauteur > 1) { hauteur = 1; largeur = RAPPORT_BANDE / rapportImage }

    setCadre({ x: (1 - largeur) / 2, y: (1 - hauteur) / 2, largeur, hauteur })
  }, [pret]) // eslint-disable-line react-hooks/exhaustive-deps

  const pointeur = (e) => {
    const r = boiteRef.current.getBoundingClientRect()
    const p = e.touches?.[0] ?? e

    return {
      x: borner((p.clientX - r.left) / r.width, 0, 1),
      y: borner((p.clientY - r.top) / r.height, 0, 1),
    }
  }

  const debut = (mode) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    glisse.current = { mode, depart: pointeur(e), cadre }
  }

  useEffect(() => {
    const bouger = (e) => {
      if (!glisse.current) return
      const { mode, depart, cadre: c0 } = glisse.current
      const p = pointeur(e)
      const dx = p.x - depart.x
      const dy = p.y - depart.y

      if (mode === 'deplacer') {
        setCadre({
          ...c0,
          x: borner(c0.x + dx, 0, 1 - c0.largeur),
          y: borner(c0.y + dy, 0, 1 - c0.hauteur),
        })

        return
      }

      // Redimensionnement : la hauteur suit la largeur pour conserver le
      // rapport de la bande. Le cadre ne peut ni sortir de l'image ni devenir
      // si petit que la bannière publiée serait floue.
      const el = imgRef.current
      const rapportImage = el.naturalWidth / el.naturalHeight
      let largeur = borner(c0.largeur + dx, 0.2, 1 - c0.x)
      let hauteur = (largeur * rapportImage) / RAPPORT_BANDE

      if (hauteur > 1 - c0.y) {
        hauteur = 1 - c0.y
        largeur = (hauteur * RAPPORT_BANDE) / rapportImage
      }

      setCadre({ ...c0, largeur, hauteur })
    }

    const finir = () => { glisse.current = null }

    window.addEventListener('mousemove', bouger)
    window.addEventListener('touchmove', bouger, { passive: false })
    window.addEventListener('mouseup', finir)
    window.addEventListener('touchend', finir)

    return () => {
      window.removeEventListener('mousemove', bouger)
      window.removeEventListener('touchmove', bouger)
      window.removeEventListener('mouseup', finir)
      window.removeEventListener('touchend', finir)
    }
  }, [])

  const enregistrer = async () => {
    if (!cadre) return
    setEnvoi(true)
    setErreur(null)
    try {
      // Arrondi à quatre décimales : le serveur refuse un cadre qui dépasse,
      // et des flottants trop longs peuvent franchir la limite par arrondi.
      const arrondi = (v) => Number(Math.min(1, Math.max(0, v)).toFixed(4))
      await onEnregistrer({
        x: arrondi(cadre.x), y: arrondi(cadre.y),
        largeur: arrondi(cadre.largeur), hauteur: arrondi(cadre.hauteur),
      })
      onFermer()
    } catch (e) {
      setErreur(e?.message || T('echec'))
    } finally {
      setEnvoi(false)
    }
  }

  const style = cadre
    ? { left: `${cadre.x * 100}%`, top: `${cadre.y * 100}%`,
        width: `${cadre.largeur * 100}%`, height: `${cadre.hauteur * 100}%` }
    : null

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4"
         role="dialog" aria-modal="true" aria-label={T('titre')}>
      <div className="bg-card rounded-2xl w-full max-w-2xl max-h-full overflow-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink">{T('titre')}</h2>
          <button type="button" onClick={onFermer} aria-label={t('commun.fermer')}
                  className="p-1.5 rounded-full text-ghost hover:bg-subtle">
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <p className="text-xs text-dim leading-relaxed mb-3">{T('aide')}</p>

        <div ref={boiteRef} className="relative select-none bg-subtle rounded-xl overflow-hidden touch-none">
          <img ref={imgRef} src={url} alt="" onLoad={() => setPret(true)}
               className="w-full block pointer-events-none" />

          {cadre && (
            <div className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,.5)] cursor-move"
                 style={style}
                 onMouseDown={debut('deplacer')}
                 onTouchStart={debut('deplacer')}>
              <span className="absolute -right-2 -bottom-2 w-4 h-4 rounded-full bg-white border border-black/20 cursor-nwse-resize"
                    onMouseDown={debut('redimensionner')}
                    onTouchStart={debut('redimensionner')} />
            </div>
          )}
        </div>

        {/* Aperçu au format RÉEL de la bande publique : le créateur voit ce que
            verront ses visiteurs, pas une approximation. */}
        <div className="mt-3">
          <span className="text-xs text-ghost">{T('apercu')}</span>
          <div className="mt-1 h-[110px] rounded-xl overflow-hidden bg-subtle">
            <img src={url} alt="" className="w-full h-full object-cover"
                 style={{ objectPosition: positionDepuisCadrage(cadre) }} />
          </div>
        </div>

        {erreur && <p className="text-xs text-danger mt-3">{erreur}</p>}

        <div className="flex items-center gap-2 mt-4">
          <button type="button" onClick={() => setCadre(null)}
                  className="inline-flex items-center gap-1.5 text-sm text-dim">
            <RotateCcw size={14} aria-hidden="true" />{T('recentrer')}
          </button>

          <button type="button" onClick={enregistrer} disabled={envoi || !cadre}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-primary text-inverse text-sm font-semibold px-5 py-2 disabled:opacity-50">
            {envoi
              ? <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              : <Check size={15} aria-hidden="true" />}
            {T('appliquer')}
          </button>
        </div>
      </div>
    </div>
  )
}
