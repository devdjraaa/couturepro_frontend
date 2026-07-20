import { useEffect, useRef, useState } from 'react'
import { RotateCw, X, Loader2, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * PHOTO-3 — Retouche légère avant validation.
 *
 * Destinée aux designers qui n'ont pas de bons moyens techniques : une photo
 * penchée, mal cadrée ou trop sombre était jusqu'ici refusée, avec un
 * aller-retour d'un jour à la clé. Le modérateur redresse, recadre et éclaircit
 * lui-même, puis publie.
 *
 * Délibérément limité au recadrage, à la rotation par quarts de tour et à deux
 * réglages de rendu : ce n'est pas un éditeur d'image, et une retouche qui
 * transformerait l'œuvre poserait un problème de droits. L'ORIGINAL est
 * conservé côté serveur quoi qu'il arrive.
 *
 * Le rendu final est fait sur un canvas à la RÉSOLUTION D'ORIGINE, pas à celle
 * de l'aperçu : recadrer ne doit pas dégrader la photo publiée.
 */

const FORMATS = [
  { cle: 'libre', ratio: null },
  { cle: 'carre', ratio: 1 },
  { cle: 'portrait', ratio: 4 / 5 },
  { cle: 'paysage', ratio: 16 / 9 },
]

// Taille minimale de la sélection, en fraction de l'image : en dessous, on
// recadre un timbre-poste et la photo publiée devient inexploitable.
const MIN_FRACTION = 0.1

const JPEG_QUALITE = 0.92

// L'aperçu est borné : redessiner une photo de 4000 px à chaque mouvement de
// curseur rendrait les réglages saccadés. L'export, lui, reste en pleine
// résolution.
const APERCU_MAX_PX = 1200

/** Ramène une valeur dans [min, max]. */
const borner = (v, min, max) => Math.min(max, Math.max(min, v))

/**
 * @param {() => Promise<string>} chargerImage  doit rendre une URL de MÊME
 *   ORIGINE (typiquement une URL d'objet issue d'un blob). Une URL distante
 *   souillerait le canvas et le navigateur refuserait d'en extraire l'image.
 */
export default function RetouchePhoto({ chargerImage, onFermer, onEnregistrer }) {
  const { t } = useTranslation()
  const T = (c) => t(`realisations.retouche.${c}`)

  const [src, setSrc] = useState(null)
  const imgRef = useRef(null)
  const apercuRef = useRef(null)
  const boiteRef = useRef(null)
  const [pret, setPret] = useState(false)
  const [rotation, setRotation] = useState(0)          // 0, 90, 180, 270
  const [format, setFormat] = useState('libre')
  const [lumiere, setLumiere] = useState(100)          // %
  const [contraste, setContraste] = useState(100)      // %
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState(null)

  // Sélection exprimée en FRACTIONS de l'image affichée (0→1), pas en pixels :
  // elle reste juste quand la fenêtre est redimensionnée ou l'image tournée.
  const [sel, setSel] = useState({ x: 0, y: 0, w: 1, h: 1 })
  const glisse = useRef(null)

  // L'URL d'objet est révoquée au démontage : sans cela, chaque ouverture de la
  // fenêtre retiendrait la photo en mémoire jusqu'au rechargement de l'onglet.
  useEffect(() => {
    let url = null
    let vivant = true

    chargerImage()
      .then((u) => {
        url = u
        if (vivant) setSrc(u)
        else URL.revokeObjectURL(u)
      })
      .catch(() => { if (vivant) setErreur(T('echec_chargement')) })

    return () => {
      vivant = false
      if (url) URL.revokeObjectURL(url)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Une rotation d'un quart de tour échange largeur et hauteur : la sélection
  // précédente n'a plus de sens, on repart de l'image entière.
  useEffect(() => { setSel({ x: 0, y: 0, w: 1, h: 1 }) }, [rotation])

  // Un format imposé recadre la sélection courante en la centrant.
  useEffect(() => {
    const f = FORMATS.find((x) => x.cle === format)
    if (!f?.ratio || !imgRef.current) return

    const el = imgRef.current
    const larg = el.naturalWidth
    const haut = el.naturalHeight
    if (!larg || !haut) return

    // Le ratio est exprimé en pixels réels ; en fractions il faut le corriger
    // par le rapport de l'image, sinon un « carré » n'est carré que sur une
    // photo déjà carrée.
    const tourne = rotation % 180 !== 0
    const ratioImage = (tourne ? haut / larg : larg / haut)
    const wFrac = Math.min(1, f.ratio / ratioImage)
    const hFrac = Math.min(1, ratioImage / f.ratio)

    setSel({ x: (1 - wFrac) / 2, y: (1 - hFrac) / 2, w: wFrac, h: hFrac })
  }, [format, rotation, pret])

  /** Dimensions de l'image APRÈS rotation — celles sur lesquelles porte la sélection. */
  const dimensions = () => {
    const el = imgRef.current
    if (!el?.naturalWidth) return null
    const tourne = rotation % 180 !== 0

    return {
      el,
      larg: tourne ? el.naturalHeight : el.naturalWidth,
      haut: tourne ? el.naturalWidth : el.naturalHeight,
    }
  }

  /**
   * Peint l'image entière, tournée et corrigée, dans le repère courant.
   * Le repère est placé de sorte que le coin haut-gauche de l'image tournée
   * tombe en (0, 0) — appelant et export partagent ainsi la même géométrie.
   */
  const peindre = (ctx, el, larg, haut) => {
    ctx.filter = `brightness(${lumiere}%) contrast(${contraste}%)`
    ctx.translate(larg / 2, haut / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.drawImage(el, -el.naturalWidth / 2, -el.naturalHeight / 2)
  }

  // Aperçu : redessiné à chaque réglage, borné en largeur pour rester fluide
  // sur une photo de 4000 px.
  useEffect(() => {
    const d = dimensions()
    const canvas = apercuRef.current
    if (!d || !canvas || !pret) return

    const k = Math.min(1, APERCU_MAX_PX / d.larg)
    canvas.width = Math.round(d.larg * k)
    canvas.height = Math.round(d.haut * k)

    const ctx = canvas.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(k, k)
    peindre(ctx, d.el, d.larg, d.haut)
  }, [pret, rotation, lumiere, contraste]) // eslint-disable-line react-hooks/exhaustive-deps

  /** Position du pointeur en fractions de la boîte d'aperçu. */
  const pointeur = (e) => {
    const r = boiteRef.current.getBoundingClientRect()
    const p = e.touches?.[0] ?? e

    return {
      x: borner((p.clientX - r.left) / r.width, 0, 1),
      y: borner((p.clientY - r.top) / r.height, 0, 1),
    }
  }

  const debutGlisse = (mode) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    glisse.current = { mode, depart: pointeur(e), sel }
  }

  useEffect(() => {
    const bouger = (e) => {
      if (!glisse.current) return
      const { mode, depart, sel: s0 } = glisse.current
      const p = pointeur(e)
      const dx = p.x - depart.x
      const dy = p.y - depart.y

      if (mode === 'deplacer') {
        setSel({ ...s0, x: borner(s0.x + dx, 0, 1 - s0.w), y: borner(s0.y + dy, 0, 1 - s0.h) })
        return
      }

      // Redimensionnement par le coin bas-droit. Avec un format imposé, la
      // hauteur suit la largeur pour ne pas casser les proportions choisies.
      const f = FORMATS.find((x) => x.cle === format)
      let w = borner(s0.w + dx, MIN_FRACTION, 1 - s0.x)
      let h = f?.ratio ? (w * s0.h) / s0.w : borner(s0.h + dy, MIN_FRACTION, 1 - s0.y)

      if (h > 1 - s0.y) {
        h = 1 - s0.y
        if (f?.ratio) w = (h * s0.w) / s0.h
      }

      setSel({ ...s0, w, h })
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
  }, [format])

  /** Rend la photo retouchée à sa résolution d'origine. */
  const produire = () => new Promise((resolve, reject) => {
    const d = dimensions()
    if (!d) { reject(new Error('image absente')); return }
    const { el, larg, haut } = d

    const sx = Math.round(sel.x * larg)
    const sy = Math.round(sel.y * haut)
    const sw = Math.max(1, Math.round(sel.w * larg))
    const sh = Math.max(1, Math.round(sel.h * haut))

    const canvas = document.createElement('canvas')
    canvas.width = sw
    canvas.height = sh
    const ctx = canvas.getContext('2d')

    // Le coin haut-gauche de la sélection est ramené en (0,0) du canvas, puis
    // l'image entière est peinte : ce qui déborde est simplement rogné.
    ctx.translate(-sx, -sy)
    peindre(ctx, el, larg, haut)

    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('rendu impossible'))),
      'image/jpeg',
      JPEG_QUALITE,
    )
  })

  const enregistrer = async () => {
    setEnvoi(true)
    setErreur(null)
    try {
      const blob = await produire()
      await onEnregistrer(blob)
      onFermer()
    } catch (e) {
      // Le modérateur doit savoir que rien n'a été enregistré : sans message,
      // il croirait la retouche appliquée et publierait l'original.
      setErreur(e?.response?.data?.message || T('echec'))
    } finally {
      setEnvoi(false)
    }
  }

  const cadre = {
    left: `${sel.x * 100}%`, top: `${sel.y * 100}%`,
    width: `${sel.w * 100}%`, height: `${sel.h * 100}%`,
  }

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
          {!src && (
            <p className="text-sm text-ghost py-10 text-center flex items-center justify-center gap-2">
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />{t('commun.chargement')}
            </p>
          )}

          {/* Source en pixels, jamais affichée : c'est le canvas qui montre le
              résultat. Un `transform: rotate` sur l'image aurait laissé sa
              boîte de mise en page inchangée, et la sélection ne serait plus
              tombée sur ce qu'on voit après un quart de tour. */}
          {src && (
            <img ref={imgRef} src={src} alt="" className="hidden"
                 onLoad={() => setPret(true)} />
          )}

          <canvas ref={apercuRef} className={`w-full block ${pret ? '' : 'hidden'}`} />

          {pret && (
            <div className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,.45)] cursor-move"
                 style={cadre}
                 onMouseDown={debutGlisse('deplacer')}
                 onTouchStart={debutGlisse('deplacer')}>
              <span className="absolute -right-2 -bottom-2 w-4 h-4 rounded-full bg-white border border-black/20 cursor-nwse-resize"
                    onMouseDown={debutGlisse('redimensionner')}
                    onTouchStart={debutGlisse('redimensionner')} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-3">
          <button type="button" onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-edge text-sm text-ink">
            <RotateCw size={14} aria-hidden="true" />{T('pivoter')}
          </button>

          {FORMATS.map((f) => (
            <button key={f.cle} type="button" onClick={() => setFormat(f.cle)}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${format === f.cle
                      ? 'bg-primary text-inverse border-primary' : 'border-edge text-dim'}`}>
              {T(`format_${f.cle}`)}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <label className="text-xs text-ghost">
            {T('lumiere')}
            <input type="range" min={60} max={160} value={lumiere} className="w-full"
                   onChange={(e) => setLumiere(Number(e.target.value))} />
          </label>
          <label className="text-xs text-ghost">
            {T('contraste')}
            <input type="range" min={60} max={160} value={contraste} className="w-full"
                   onChange={(e) => setContraste(Number(e.target.value))} />
          </label>
        </div>

        {erreur && <p className="text-xs text-danger mt-3">{erreur}</p>}

        <div className="flex items-center gap-2 mt-4">
          <button type="button" onClick={() => {
            setRotation(0); setFormat('libre'); setLumiere(100); setContraste(100)
            setSel({ x: 0, y: 0, w: 1, h: 1 })
          }} className="text-sm text-dim">
            {T('reinitialiser')}
          </button>

          <button type="button" onClick={enregistrer} disabled={envoi || !pret}
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
