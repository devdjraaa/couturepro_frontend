// SUG-1 — Écran de démarrage : « favicon → logo → connexion ».
//
// Le splash NATIF (android/app/src/main/res/drawable*/splash.png) est une image
// figée posée en fond de fenêtre : Android l'affiche le temps que la WebView
// démarre, on ne peut ni l'animer ni le dater. C'est lui, l'icône « pas wow ».
//
// Ce composant prend le relais dès que le web est prêt et fait le pont jusqu'à
// l'application : la marque apparaît, respire, puis s'efface. L'utilisateur ne
// voit plus une image plaquée mais une ouverture qui s'enchaîne.
//
// Il porte aussi l'HABILLAGE SAISONNIER (brief 16/07, pt 6). Son socle serveur
// existait depuis juillet — `GET /vitrine/splash-theme` renvoie la période
// active, `PUT /admin/vitrine/splash-themes` en configure jusqu'à vingt — mais
// AUCUN écran ne l'appelait : la fonctionnalité vivait dans des routes que
// personne ne consommait. Quand une période est active (Ramadan, Noël, fête
// nationale…), son visuel et son texte remplacent l'écran de marque.
//
// Garde-fous, parce qu'un écran d'ouverture qui s'impose est vite détesté :
//   · une seule fois par session, jamais à chaque navigation ;
//   · passable immédiatement (clic, Échap, Entrée, Espace) ;
//   · `prefers-reduced-motion` → rien du tout ;
//   · l'habillage n'attend jamais son image : serveur lent ou hors ligne, on
//     montre la marque et on continue.
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API_BASE_URL } from '@/constants/config'

const DUREE_MARQUE = 1500
const DUREE_SAISON = 2300

export default function SplashDemarrage() {
  const { t } = useTranslation()
  const [actif, setActif] = useState(false)
  const [theme, setTheme] = useState(null)
  const [visible, setVisible] = useState(false)
  const minuteurs = useRef([])

  const fermer = () => {
    setVisible(false)
    minuteurs.current.push(setTimeout(() => setActif(false), 480))
  }

  useEffect(() => {
    // Rejoué à CHAQUE chargement de page — au lancement de l'application comme
    // au rechargement d'un onglet ou à l'arrivée par une URL directe. Ce
    // composant étant monté à la racine, une navigation INTERNE ne le remonte
    // pas : on ne le revoit donc pas en passant d'un écran à l'autre.
    //
    // (Un garde par `sessionStorage` avait été essayé : il survivait aux
    // rechargements, si bien qu'on ne voyait l'ouverture qu'une fois par onglet.)

    // L'utilisateur a demandé qu'on lui épargne les animations : on n'insiste pas.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return

    setActif(true)
    setVisible(true)

    let mort = false
    // L'habillage saisonnier est un BONUS : on lance l'écran de marque tout de
    // suite et on l'enrichit si la réponse arrive à temps. Jamais l'inverse —
    // faire attendre l'ouverture pour un décor serait absurde.
    minuteurs.current.push(setTimeout(fermer, DUREE_MARQUE))

    fetch(`${API_BASE_URL}/vitrine/splash-theme`, { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (mort || !d?.actif) return
        setTheme(d)
        // Période active : on laisse un peu plus de temps pour la lire.
        minuteurs.current.forEach(clearTimeout)
        minuteurs.current = [setTimeout(fermer, DUREE_SAISON)]
      })
      .catch(() => { /* hors ligne : l'écran de marque suffit */ })

    return () => { mort = true; minuteurs.current.forEach(clearTimeout) }
  }, [])

  useEffect(() => {
    if (!actif) return
    const auClavier = (e) => {
      if (['Escape', 'Enter', ' '].includes(e.key)) fermer()
    }
    window.addEventListener('keydown', auClavier)

    return () => window.removeEventListener('keydown', auClavier)
  }, [actif])

  if (!actif) return null

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={t('commun.fermer')}
      onClick={fermer}
      className={'fixed inset-0 z-[120] flex flex-col items-center justify-center gap-6 bg-app '
        + 'transition-opacity duration-500 ' + (visible ? 'opacity-100' : 'opacity-0 pointer-events-none')}
    >
      {theme ? (
        <>
          {theme.image_url && (
            <img
              src={theme.image_url}
              alt=""
              onError={(e) => { e.currentTarget.style.display = 'none' }}
              className="max-w-[70vw] max-h-[38vh] object-contain gx-splash-entree"
            />
          )}
          <p className="font-display font-extrabold text-[clamp(22px,5vw,34px)] text-primary tracking-tight gx-splash-entree">
            {theme.nom}
          </p>
          {theme.texte && (
            <p className="max-w-[80vw] text-center text-[14.5px] text-dim leading-relaxed gx-splash-entree">
              {theme.texte}
            </p>
          )}
        </>
      ) : (
        <>
          {/* Le « o » du logotype, reconstruit dans l'ordre voulu par la
              direction : le POINT ROUGE d'abord, puis l'ANNEAU NOIR de la
              lettre, puis l'ARC ROUGE qui se trace autour.

              Dessiné en SVG et non en image : net à toute taille, et surtout
              chaque élément est animable séparément, ce qu'une image ne permet
              pas. Les proportions sont relevées sur le logo officiel coloré
              (public/logo-officiel.png) : point central, anneau noir épais,
              arc rouge de rayon 42 ouvert sur la gauche, balayé sur 300°. */}
          <svg viewBox="0 0 100 100" className="w-[132px] h-[132px]" aria-hidden="true">
            {/* 3. L'ARC ROUGE — tracé en dernier.

                Il s'AFFINE progressivement, comme dans le logo officiel : ce
                n'est donc pas un trait mais un CONTOUR REMPLI dont l'épaisseur
                varie (0,9 au départ, 4,6 à l'arrivée). Un `stroke` SVG a une
                épaisseur constante et rendait l'arc lourd et raide.

                Comme un remplissage ne se prête pas au tracé progressif, on le
                dévoile par un MASQUE : un trait circulaire dont on anime le
                pointillé balaie la forme et la fait apparaître d'un bout à
                l'autre. */}
            <mask id="gx-arc-mask">
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#fff"
                strokeWidth="12"
                strokeLinecap="round"
                transform="rotate(-172 50 50)"
                className="gx-splash-arc-reveal"
              />
            </mask>
            <path
              d="M 7.96 44.09 L 8.21 42.25 L 8.55 40.43 L 8.98 38.62 L 9.49 36.84 L 10.08 35.07 L 10.74 33.34 L 11.49 31.63 L 12.30 29.96 L 13.20 28.32 L 14.16 26.72 L 15.19 25.17 L 16.29 23.66 L 17.46 22.20 L 18.68 20.80 L 19.97 19.45 L 21.32 18.15 L 22.73 16.91 L 24.18 15.74 L 25.69 14.63 L 27.25 13.59 L 28.85 12.62 L 30.49 11.71 L 32.17 10.88 L 33.89 10.13 L 35.64 9.45 L 37.42 8.84 L 39.22 8.32 L 41.05 7.87 L 42.89 7.50 L 44.75 7.22 L 46.62 7.01 L 48.49 6.89 L 50.38 6.85 L 52.26 6.89 L 54.14 7.01 L 56.01 7.22 L 57.88 7.51 L 59.72 7.88 L 61.56 8.33 L 63.37 8.86 L 65.16 9.46 L 66.92 10.15 L 68.64 10.91 L 70.34 11.75 L 71.99 12.66 L 73.61 13.64 L 75.18 14.70 L 76.71 15.82 L 78.18 17.00 L 79.61 18.25 L 80.97 19.56 L 82.28 20.93 L 83.53 22.36 L 84.71 23.84 L 85.83 25.37 L 86.89 26.95 L 87.87 28.58 L 88.78 30.24 L 89.62 31.95 L 90.38 33.69 L 91.06 35.46 L 91.67 37.26 L 92.20 39.09 L 92.65 40.93 L 93.02 42.80 L 93.31 44.68 L 93.51 46.58 L 93.63 48.48 L 93.67 50.38 L 93.62 52.29 L 93.50 54.19 L 93.29 56.08 L 92.99 57.97 L 92.62 59.84 L 92.16 61.69 L 91.62 63.52 L 91.00 65.33 L 90.31 67.11 L 89.54 68.86 L 88.69 70.57 L 87.76 72.24 L 86.77 73.88 L 85.70 75.47 L 84.57 77.01 L 83.37 78.50 L 82.10 79.93 L 80.77 81.31 L 79.39 82.64 L 77.94 83.90 L 76.44 85.09 L 74.90 86.22 L 73.30 87.29 L 71.66 88.28 L 69.97 89.20 L 68.25 90.04 L 66.49 90.81 L 64.70 91.50 L 62.88 92.11 L 61.03 92.65 L 59.16 93.10 L 57.27 93.47 L 55.37 93.76 L 53.46 93.96 L 51.54 94.08 L 49.61 94.12 L 47.69 94.08 L 45.77 93.94 L 43.85 93.73 L 41.95 93.43 L 40.06 93.05 L 38.19 92.59 L 36.34 92.04 L 34.51 91.42 L 32.72 90.71 L 30.95 89.93 L 29.22 89.07 L 27.53 88.14 L 25.89 87.13 L 24.28 86.06 L 22.73 84.91 L 25.56 81.28 L 26.94 82.33 L 28.37 83.31 L 29.83 84.24 L 31.34 85.09 L 32.88 85.89 L 34.46 86.61 L 36.07 87.26 L 37.70 87.85 L 39.36 88.36 L 41.04 88.80 L 42.74 89.16 L 44.46 89.45 L 46.18 89.67 L 47.91 89.81 L 49.65 89.87 L 51.39 89.86 L 53.13 89.78 L 54.86 89.61 L 56.59 89.38 L 58.30 89.06 L 60.00 88.68 L 61.68 88.21 L 63.34 87.68 L 64.98 87.07 L 66.59 86.40 L 68.16 85.65 L 69.71 84.83 L 71.21 83.95 L 72.68 83.00 L 74.11 81.99 L 75.49 80.92 L 76.82 79.79 L 78.10 78.60 L 79.33 77.35 L 80.51 76.06 L 81.63 74.71 L 82.68 73.31 L 83.68 71.87 L 84.61 70.39 L 85.48 68.87 L 86.28 67.31 L 87.01 65.71 L 87.68 64.09 L 88.27 62.43 L 88.79 60.76 L 89.23 59.06 L 89.60 57.34 L 89.90 55.61 L 90.12 53.86 L 90.26 52.11 L 90.33 50.35 L 90.32 48.59 L 90.23 46.83 L 90.07 45.08 L 89.83 43.34 L 89.51 41.60 L 89.12 39.88 L 88.66 38.18 L 88.12 36.50 L 87.50 34.85 L 86.82 33.22 L 86.07 31.62 L 85.24 30.06 L 84.35 28.54 L 83.39 27.05 L 82.37 25.61 L 81.29 24.21 L 80.14 22.86 L 78.94 21.56 L 77.68 20.31 L 76.37 19.12 L 75.01 17.99 L 73.60 16.92 L 72.14 15.91 L 70.64 14.96 L 69.10 14.08 L 67.52 13.27 L 65.91 12.53 L 64.26 11.86 L 62.59 11.26 L 60.89 10.73 L 59.17 10.28 L 57.43 9.90 L 55.68 9.60 L 53.91 9.37 L 52.14 9.22 L 50.36 9.15 L 48.57 9.16 L 46.79 9.25 L 45.02 9.41 L 43.25 9.65 L 41.49 9.97 L 39.75 10.36 L 38.02 10.83 L 36.32 11.37 L 34.64 11.99 L 32.99 12.68 L 31.37 13.44 L 29.79 14.27 L 28.24 15.17 L 26.73 16.14 L 25.26 17.17 L 23.84 18.27 L 22.47 19.43 L 21.15 20.64 L 19.88 21.91 L 18.67 23.24 L 17.52 24.62 L 16.42 26.05 L 15.39 27.53 L 14.43 29.05 L 13.53 30.61 L 12.70 32.21 L 11.93 33.84 L 11.24 35.51 L 10.62 37.20 L 10.07 38.93 L 9.60 40.67 L 9.20 42.44 L 8.85 44.22 Z"
              fill="var(--color-primary)"
              mask="url(#gx-arc-mask)"
            />

            {/* 2. L'anneau noir : la lettre elle-même. */}
            <circle
              cx="50" cy="50" r="21"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="12"
              className="gx-splash-anneau"
            />
            {/* 1. Le point rouge, au centre — il apparaît en premier. */}
            <circle cx="50" cy="50" r="7" fill="var(--color-primary)" className="gx-splash-point" />
          </svg>
        </>
      )}
    </div>
  )
}
