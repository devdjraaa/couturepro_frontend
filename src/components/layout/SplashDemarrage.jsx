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
            {/* L'ARC ROUGE, tracé progressivement.

                Il était dessiné comme un CROISSANT (tracé rempli de plusieurs
                centaines de points) révélé par un MASQUE animé. Fluide sur un
                ordinateur, saccadé sur l'appareil : la WebView doit re-rasteriser
                ce tracé à CHAQUE image de l'animation.
                Ici c'est un simple cercle au trait, révélé par `stroke-dashoffset` :
                le même geste, sans masque ni tracé complexe à recalculer. */}
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="3.4"
              strokeLinecap="round"
              transform="rotate(-176 50 50)"
              className="gx-splash-arc-reveal"
            />

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
