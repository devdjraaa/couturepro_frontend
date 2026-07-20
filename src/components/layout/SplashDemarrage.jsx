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
          <svg viewBox="0 -58 100 158" className="w-[168px] h-[265px] -mt-[97px]" aria-hidden="true" style={{ overflow: 'visible' }}>
            {/* L'ARC ROUGE et l'ANNEAU NOIR arrivent EN MÊME TEMPS : l'anneau
                se révèle en fondu pendant que l'arc se trace, au même rythme.

                L'arc part de la GAUCHE, passe par le haut, descend à droite et
                S'ARRÊTE AVANT LE BAS du « o » — 205°, soit 4/7 du tour, comme
                le logo. Il ne fait jamais le tour complet.

                Sa forme est celle d'un CROISSANT DE LUNE très fin : épaisseur
                nulle aux deux extrémités — donc des bouts francs, pointus — et
                à peine 2,8 au plus large. Une première version allait du fin
                vers l'épais et finissait en massue.

                Un trait SVG ayant une épaisseur constante, c'est un contour
                REMPLI ; et comme un remplissage ne se prête pas au tracé
                progressif, il est dévoilé par un masque animé. */}
            <defs>
            <mask id="gx-arc-mask" maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
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
            </defs>
            <path d="M 5.11 46.86 L 5.10 45.91 L 5.14 44.96 L 5.21 44.01 L 5.31 43.06 L 5.43 42.12 L 5.57 41.17 L 5.73 40.23 L 5.91 39.30 L 6.12 38.36 L 6.35 37.43 L 6.59 36.51 L 6.86 35.59 L 7.15 34.68 L 7.45 33.77 L 7.78 32.87 L 8.13 31.97 L 8.49 31.08 L 8.88 30.20 L 9.28 29.33 L 9.71 28.47 L 10.15 27.61 L 10.61 26.77 L 11.09 25.93 L 11.58 25.11 L 12.10 24.29 L 12.63 23.49 L 13.18 22.70 L 13.75 21.92 L 14.33 21.15 L 14.93 20.39 L 15.55 19.65 L 16.18 18.92 L 16.83 18.20 L 17.50 17.50 L 18.18 16.81 L 18.87 16.13 L 19.58 15.47 L 20.30 14.83 L 21.04 14.20 L 21.79 13.59 L 22.55 12.99 L 23.33 12.41 L 24.12 11.84 L 24.92 11.30 L 25.73 10.76 L 26.56 10.25 L 27.39 9.76 L 28.24 9.28 L 29.10 8.82 L 29.96 8.38 L 30.84 7.95 L 31.72 7.55 L 32.62 7.16 L 33.52 6.80 L 34.43 6.45 L 35.34 6.12 L 36.27 5.82 L 37.20 5.53 L 38.13 5.26 L 39.08 5.01 L 40.02 4.78 L 40.98 4.58 L 41.93 4.39 L 42.89 4.22 L 43.86 4.08 L 44.83 3.95 L 45.79 3.85 L 46.77 3.76 L 47.74 3.70 L 48.72 3.66 L 49.69 3.63 L 50.67 3.63 L 51.64 3.65 L 52.62 3.69 L 53.59 3.76 L 54.56 3.84 L 55.54 3.94 L 56.50 4.07 L 57.47 4.21 L 58.43 4.38 L 59.39 4.56 L 60.34 4.77 L 61.29 5.00 L 62.24 5.24 L 63.18 5.51 L 64.11 5.80 L 65.04 6.11 L 65.96 6.43 L 66.87 6.78 L 67.78 7.14 L 68.67 7.53 L 69.56 7.93 L 70.44 8.36 L 71.31 8.80 L 72.17 9.26 L 73.02 9.74 L 73.86 10.24 L 74.69 10.75 L 75.51 11.28 L 76.32 11.83 L 77.11 12.40 L 77.90 12.98 L 78.66 13.58 L 79.42 14.20 L 80.16 14.83 L 80.89 15.48 L 81.61 16.14 L 82.31 16.82 L 82.99 17.51 L 83.66 18.22 L 84.32 18.94 L 84.96 19.67 L 85.58 20.42 L 86.19 21.18 L 86.78 21.96 L 87.35 22.74 L 87.91 23.54 L 88.45 24.35 L 88.97 25.17 L 89.47 26.00 L 89.96 26.85 L 90.43 27.70 L 90.88 28.56 L 91.31 29.43 L 91.72 30.31 L 92.11 31.20 L 92.49 32.09 L 92.84 33.00 L 93.18 33.91 L 93.49 34.83 L 93.79 35.75 L 94.06 36.68 L 94.32 37.61 L 94.55 38.55 L 94.77 39.50 L 94.96 40.44 L 95.13 41.39 L 95.29 42.35 L 95.42 43.31 L 95.53 44.27 L 95.63 45.23 L 95.70 46.19 L 95.75 47.15 L 95.78 48.12 L 95.79 49.08 L 95.77 50.05 L 95.74 51.01 L 95.69 51.97 L 95.62 52.93 L 95.52 53.89 L 95.41 54.84 L 95.27 55.79 L 95.11 56.74 L 94.94 57.69 L 94.74 58.63 L 94.52 59.56 L 94.29 60.49 L 94.03 61.41 L 93.75 62.33 L 93.46 63.24 L 93.14 64.14 L 92.80 65.03 L 92.45 65.92 L 92.07 66.80 L 91.67 67.66 L 91.26 68.52 L 90.82 69.37 L 90.37 70.20 L 89.88 71.02 L 89.36 71.82 L 89.36 71.82 L 89.73 70.94 L 90.12 70.08 L 90.49 69.21 L 90.85 68.34 L 91.19 67.46 L 91.51 66.57 L 91.82 65.69 L 92.11 64.79 L 92.38 63.89 L 92.64 62.99 L 92.87 62.08 L 93.09 61.17 L 93.29 60.25 L 93.47 59.33 L 93.63 58.41 L 93.77 57.49 L 93.90 56.56 L 94.00 55.63 L 94.09 54.70 L 94.15 53.77 L 94.20 52.84 L 94.23 51.91 L 94.24 50.98 L 94.23 50.05 L 94.20 49.12 L 94.15 48.19 L 94.08 47.26 L 93.99 46.33 L 93.89 45.41 L 93.76 44.49 L 93.62 43.57 L 93.45 42.66 L 93.27 41.75 L 93.07 40.84 L 92.85 39.94 L 92.62 39.05 L 92.36 38.16 L 92.09 37.27 L 91.80 36.40 L 91.49 35.52 L 91.16 34.66 L 90.81 33.80 L 90.45 32.95 L 90.07 32.11 L 89.67 31.28 L 89.26 30.45 L 88.82 29.64 L 88.38 28.83 L 87.91 28.03 L 87.43 27.25 L 86.93 26.47 L 86.42 25.70 L 85.89 24.95 L 85.35 24.21 L 84.79 23.47 L 84.22 22.75 L 83.63 22.05 L 83.03 21.35 L 82.41 20.67 L 81.78 20.00 L 81.13 19.34 L 80.48 18.70 L 79.81 18.07 L 79.12 17.45 L 78.43 16.85 L 77.72 16.27 L 77.00 15.70 L 76.27 15.14 L 75.53 14.60 L 74.77 14.08 L 74.01 13.57 L 73.23 13.07 L 72.45 12.60 L 71.65 12.13 L 70.85 11.69 L 70.04 11.26 L 69.22 10.85 L 68.39 10.46 L 67.55 10.08 L 66.71 9.72 L 65.86 9.38 L 65.00 9.06 L 64.13 8.75 L 63.26 8.47 L 62.38 8.20 L 61.50 7.94 L 60.61 7.71 L 59.72 7.50 L 58.82 7.30 L 57.92 7.12 L 57.02 6.96 L 56.11 6.82 L 55.20 6.70 L 54.29 6.60 L 53.38 6.51 L 52.46 6.45 L 51.54 6.40 L 50.63 6.38 L 49.71 6.37 L 48.79 6.38 L 47.87 6.41 L 46.96 6.46 L 46.04 6.53 L 45.12 6.61 L 44.21 6.72 L 43.30 6.84 L 42.39 6.99 L 41.49 7.15 L 40.59 7.33 L 39.69 7.53 L 38.79 7.75 L 37.91 7.98 L 37.02 8.24 L 36.14 8.51 L 35.27 8.80 L 34.40 9.11 L 33.54 9.44 L 32.69 9.79 L 31.84 10.15 L 31.00 10.53 L 30.17 10.93 L 29.34 11.34 L 28.53 11.78 L 27.72 12.23 L 26.93 12.69 L 26.14 13.17 L 25.36 13.67 L 24.59 14.19 L 23.84 14.72 L 23.09 15.27 L 22.36 15.83 L 21.63 16.40 L 20.92 17.00 L 20.22 17.60 L 19.54 18.23 L 18.86 18.86 L 18.20 19.51 L 17.55 20.18 L 16.92 20.85 L 16.30 21.54 L 15.69 22.25 L 15.10 22.96 L 14.53 23.69 L 13.96 24.43 L 13.42 25.19 L 12.88 25.95 L 12.37 26.73 L 11.87 27.51 L 11.38 28.31 L 10.92 29.12 L 10.46 29.93 L 10.03 30.76 L 9.61 31.59 L 9.21 32.44 L 8.83 33.29 L 8.46 34.15 L 8.11 35.02 L 7.78 35.90 L 7.46 36.78 L 7.17 37.67 L 6.89 38.57 L 6.63 39.47 L 6.38 40.38 L 6.16 41.29 L 5.95 42.21 L 5.76 43.13 L 5.58 44.06 L 5.42 44.99 L 5.27 45.92 L 5.11 46.86 Z" fill="var(--color-primary)" mask="url(#gx-arc-mask)" />

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
