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

const CLE_SESSION = 'gx_splash_vu'
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
    // Déjà vu dans cette session : on ne rejoue pas à chaque navigation.
    try {
      if (sessionStorage.getItem(CLE_SESSION)) return
      sessionStorage.setItem(CLE_SESSION, '1')
    } catch { return }

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
          {/* Le signe de la marque : l'anneau se trace, le point apparaît.
              Dessiné en SVG plutôt qu'en image — net à toute taille, et animable. */}
          <svg viewBox="0 0 64 64" className="w-[92px] h-[92px]" aria-hidden="true">
            <path
              d="M32 6a26 26 0 1 0 26 26"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="7"
              strokeLinecap="round"
              className="gx-splash-anneau"
            />
            <circle cx="32" cy="32" r="9" fill="var(--color-primary)" className="gx-splash-point" />
          </svg>

          <p className="font-display font-extrabold text-[clamp(24px,6vw,38px)] tracking-[0.14em] text-ink gx-splash-mot">
            GEXTIMO
          </p>
        </>
      )}
    </div>
  )
}
