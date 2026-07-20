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

const DUREE_MARQUE = 2150
const DUREE_SAISON = 2600

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
          <svg viewBox="0 0 100 100" className="w-[168px] h-[168px]" aria-hidden="true">
            {/* L'ARC ROUGE et l'ANNEAU NOIR arrivent EN MÊME TEMPS : l'anneau
                se révèle en fondu pendant que l'arc se trace, au même rythme.

                L'arc part de la GAUCHE, passe par le haut, descend à droite et
                S'ARRÊTE AVANT LE BAS du « o » — 205°, soit 4/7 du tour, comme
                le logo. Il ne fait jamais le tour complet.

                Il s'affine aussi : ce n'est donc pas un trait mais un contour
                rempli dont l'épaisseur varie, dévoilé par un masque animé, car
                un remplissage ne se prête pas au tracé progressif. */}
            <mask id="gx-arc-mask">
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#fff"
                strokeWidth="14"
                strokeLinecap="round"
                transform="rotate(-176 50 50)"
                className="gx-splash-arc-reveal"
              />
            </mask>
            <path d="M 4.71 46.83 L 4.76 45.58 L 4.86 44.33 L 5.01 43.09 L 5.19 41.85 L 5.40 40.61 L 5.66 39.39 L 5.94 38.16 L 6.26 36.95 L 6.62 35.74 L 7.01 34.55 L 7.43 33.36 L 7.89 32.19 L 8.38 31.03 L 8.90 29.89 L 9.45 28.75 L 10.04 27.64 L 10.65 26.54 L 11.30 25.46 L 11.98 24.39 L 12.68 23.34 L 13.42 22.32 L 14.18 21.31 L 14.97 20.33 L 15.79 19.36 L 16.64 18.42 L 17.51 17.51 L 18.40 16.62 L 19.32 15.75 L 20.27 14.91 L 21.24 14.09 L 22.23 13.30 L 23.24 12.54 L 24.27 11.80 L 25.33 11.10 L 26.40 10.42 L 27.49 9.78 L 28.60 9.16 L 29.73 8.58 L 30.87 8.02 L 32.03 7.50 L 33.20 7.01 L 34.38 6.55 L 35.58 6.12 L 36.79 5.73 L 38.01 5.37 L 39.24 5.05 L 40.48 4.76 L 41.72 4.50 L 42.98 4.28 L 44.24 4.09 L 45.50 3.94 L 46.77 3.82 L 48.04 3.73 L 49.32 3.69 L 50.59 3.67 L 51.87 3.69 L 53.14 3.75 L 54.41 3.84 L 55.68 3.97 L 56.95 4.13 L 58.21 4.33 L 59.47 4.56 L 60.72 4.83 L 61.96 5.13 L 63.19 5.47 L 64.42 5.84 L 65.63 6.24 L 66.83 6.67 L 68.02 7.14 L 69.20 7.65 L 70.36 8.18 L 71.51 8.75 L 72.64 9.35 L 73.76 9.97 L 74.86 10.63 L 75.94 11.32 L 77.00 12.04 L 78.04 12.79 L 79.06 13.57 L 80.06 14.38 L 81.03 15.21 L 81.99 16.07 L 82.91 16.95 L 83.82 17.86 L 84.70 18.80 L 85.55 19.76 L 86.38 20.74 L 87.18 21.75 L 87.95 22.78 L 88.69 23.83 L 89.41 24.90 L 90.09 25.98 L 90.75 27.09 L 91.37 28.22 L 91.96 29.36 L 92.52 30.52 L 93.05 31.69 L 93.55 32.88 L 94.01 34.08 L 94.45 35.29 L 94.84 36.52 L 95.21 37.76 L 95.54 39.00 L 95.83 40.26 L 96.09 41.52 L 96.32 42.79 L 96.51 44.07 L 96.66 45.35 L 96.78 46.63 L 96.87 47.92 L 96.92 49.21 L 96.93 50.50 L 96.91 51.80 L 96.85 53.09 L 96.76 54.38 L 96.63 55.66 L 96.46 56.94 L 96.26 58.22 L 96.03 59.49 L 95.76 60.76 L 95.46 62.02 L 95.12 63.27 L 94.74 64.50 L 94.34 65.73 L 93.89 66.95 L 93.42 68.16 L 92.91 69.35 L 92.37 70.53 L 91.80 71.69 L 91.19 72.83 L 87.52 70.80 L 88.09 69.76 L 88.63 68.71 L 89.13 67.64 L 89.61 66.56 L 90.06 65.47 L 90.48 64.37 L 90.87 63.25 L 91.23 62.12 L 91.56 60.99 L 91.85 59.84 L 92.12 58.69 L 92.35 57.53 L 92.55 56.36 L 92.72 55.19 L 92.85 54.01 L 92.96 52.83 L 93.03 51.65 L 93.07 50.46 L 93.07 49.28 L 93.05 48.09 L 92.99 46.91 L 92.89 45.72 L 92.77 44.54 L 92.61 43.37 L 92.42 42.20 L 92.20 41.03 L 91.95 39.87 L 91.66 38.72 L 91.35 37.57 L 91.00 36.43 L 90.62 35.31 L 90.21 34.19 L 89.77 33.09 L 89.30 32.00 L 88.80 30.92 L 88.26 29.85 L 87.70 28.80 L 87.12 27.77 L 86.50 26.75 L 85.85 25.75 L 85.18 24.76 L 84.48 23.80 L 83.75 22.85 L 83.00 21.93 L 82.23 21.02 L 81.42 20.14 L 80.60 19.28 L 79.75 18.44 L 78.87 17.63 L 77.98 16.84 L 77.06 16.07 L 76.13 15.33 L 75.17 14.62 L 74.19 13.93 L 73.19 13.27 L 72.18 12.63 L 71.15 12.03 L 70.10 11.45 L 69.04 10.90 L 67.96 10.38 L 66.87 9.89 L 65.76 9.43 L 64.64 9.00 L 63.51 8.61 L 62.37 8.24 L 61.22 7.90 L 60.06 7.60 L 58.89 7.33 L 57.71 7.09 L 56.53 6.88 L 55.35 6.71 L 54.15 6.56 L 52.96 6.45 L 51.76 6.38 L 50.56 6.33 L 49.35 6.32 L 48.15 6.35 L 46.95 6.40 L 45.75 6.49 L 44.55 6.61 L 43.36 6.77 L 42.17 6.95 L 40.99 7.17 L 39.81 7.42 L 38.64 7.71 L 37.47 8.03 L 36.32 8.37 L 35.18 8.75 L 34.04 9.17 L 32.92 9.61 L 31.81 10.08 L 30.71 10.59 L 29.63 11.12 L 28.56 11.68 L 27.51 12.28 L 26.47 12.90 L 25.45 13.55 L 24.45 14.23 L 23.46 14.93 L 22.50 15.66 L 21.56 16.42 L 20.63 17.21 L 19.73 18.02 L 18.85 18.85 L 18.00 19.71 L 17.16 20.59 L 16.36 21.50 L 15.57 22.43 L 14.81 23.37 L 14.08 24.34 L 13.38 25.33 L 12.70 26.34 L 12.04 27.37 L 11.42 28.41 L 10.83 29.47 L 10.26 30.55 L 9.72 31.65 L 9.22 32.75 L 8.74 33.88 L 8.29 35.01 L 7.88 36.16 L 7.49 37.32 L 7.14 38.48 L 6.82 39.66 L 6.53 40.85 L 6.27 42.05 L 6.04 43.25 L 5.84 44.46 L 5.67 45.67 L 5.51 46.89 Z" fill="var(--color-primary)" mask="url(#gx-arc-mask)" />

            {/* L'anneau du « o », agrandi. */}
            <circle
              cx="50" cy="50" r="27"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="15"
              className="gx-splash-anneau"
            />

            {/* Le point rouge : il TOMBE du haut et rebondit sur ce point,
                avec une légère dilatation à l'impact. Le centre de l'écran lui
                sert de sol. */}
            <circle cx="50" cy="50" r="9" fill="var(--color-primary)" className="gx-splash-point" />
          </svg>

          <p className="font-display font-bold text-[clamp(26px,7vw,40px)] text-ink lowercase tracking-tight gx-splash-mot">
            gextimo
          </p>
        </>
      )}
    </div>
  )
}
