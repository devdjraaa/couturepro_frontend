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
          {/* Le « o » du logotype, RELEVÉ AU PIXEL sur le logo officiel
              (public/logo-officiel.png) plutôt qu'estimé à l'œil.

              L'ancien dessin plaçait l'arc à un rayon de 45 pour un anneau de
              27 : il en était trop proche et trop court. Le relevé donne un
              tout autre objet — l'arc n'est pas un cercle mais une SPIRALE,
              dont le rayon passe de 67 aux extrémités à 54 au milieu, et dont
              l'épaisseur va de 0 à 6 puis revient à 0. C'est ce double effet
              qui lui donne sa forme de croissant.

              Balayage relevé : 196°, du bas-droite (312°) vers le haut-gauche
              (148°) en remontant par la droite.

              58 points au lieu de plusieurs centaines : c'est la finesse du
              tracé, pas le masque, qui faisait accrocher l'ouverture. */}
          <svg viewBox="-20 -58 140 158" className="w-[235px] h-[265px] -mt-[97px]" aria-hidden="true">
            {/* L'arc se dévoile d'un bout à l'autre. Un remplissage ne sait pas
                se tracer progressivement : on révèle le croissant par un masque
                dont la ligne centrale, elle, se trace. `pathLength="1"` la
                normalise, si bien que l'animation ne dépend plus d'une longueur
                calculée à la main — celle d'avant valait 161 et ne correspondait
                plus au tracé depuis longtemps. */}
            <mask id="gx-arc-mask" maskUnits="userSpaceOnUse" x="-25" y="-25" width="150" height="150">
              <path
                d="M 94.7 99.7 L 99.8 93.3 L 103.6 86.2 L 106.4 78.8 L 108.3 71.2 L 109.3 63.7 L 109.3 56.2 L 108.5 49.0 L 107.0 42.0 L 104.7 35.3 L 101.8 29.1 L 98.3 23.3 L 94.2 17.9 L 89.7 13.0 L 84.7 8.7 L 79.3 4.9 L 73.6 1.7 L 67.6 -1.0 L 61.3 -3.0 L 54.8 -4.4 L 48.1 -5.1 L 41.3 -5.1 L 34.4 -4.3 L 27.6 -2.8 L 20.8 -0.6 L 14.2 2.5 L 7.9 6.4 L 1.9 11.1 L -3.1 16.8"
                pathLength="1" fill="none" stroke="#fff" strokeWidth="13"
                className="gx-splash-arc-reveal"
              />
            </mask>

            {/* Le croissant rouge. */}
            <path d="M 94.9 99.8 L 100.3 93.7 L 104.5 86.8 L 107.7 79.4 L 110.0 71.8 L 111.2 64.1 L 111.5 56.5 L 110.9 48.9 L 109.6 41.6 L 107.3 34.6 L 104.4 28.0 L 100.8 21.8 L 96.6 16.1 L 91.8 11.0 L 86.6 6.4 L 80.9 2.4 L 74.9 -1.0 L 68.5 -3.7 L 61.8 -5.7 L 55.0 -7.0 L 48.0 -7.6 L 40.9 -7.4 L 33.8 -6.4 L 26.8 -4.7 L 19.9 -2.1 L 13.3 1.3 L 7.1 5.6 L 1.4 10.7 L -3.5 16.6 L -2.8 17.0 L 2.5 11.5 L 8.7 7.2 L 15.1 3.7 L 21.7 1.0 L 28.4 -0.9 L 35.0 -2.1 L 41.7 -2.7 L 48.2 -2.5 L 54.5 -1.7 L 60.7 -0.2 L 66.6 1.8 L 72.3 4.3 L 77.7 7.4 L 82.8 11.0 L 87.5 15.0 L 91.8 19.6 L 95.7 24.7 L 99.1 30.2 L 102.0 36.1 L 104.4 42.4 L 106.1 49.0 L 107.1 56.0 L 107.3 63.2 L 106.6 70.6 L 105.1 78.1 L 102.8 85.6 L 99.4 92.9 L 94.6 99.5 Z" fill="var(--color-primary)" mask="url(#gx-arc-mask)" />

            {/* L'anneau noir du « o » : épaisseur 17 pour un rayon 27, relevée
                sur le logo (rayons 70 et 134 px, ramenés à notre échelle). */}
            <circle cx="50" cy="50" r="27" fill="none" stroke="var(--color-ink)"
                    strokeWidth="17" className="gx-splash-anneau" />

            {/* Le point rouge : il tombe du haut et rebondit. Rayon 10,4 relevé
                sur le logo, contre 9 auparavant. */}
            <circle cx="50" cy="50" r="10.4" fill="var(--color-primary)" className="gx-splash-point" />
          </svg>

          <p className="gx-logotype font-bold text-[clamp(26px,7vw,40px)] text-ink lowercase tracking-tight gx-splash-mot">
            gextimo
          </p>
        </>
      )}
    </div>
  )
}
