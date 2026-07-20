import { useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home, Users, ClipboardList, Layers, Settings, Scissors,
  Bell, Star, Users2, LogOut, HelpCircle, Archive, Wallet, Store, FileText, Palette, Images, History, Sparkles, Megaphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts'
import { useAccountType } from '@/hooks/useAccountType'
import { ROUTES } from '@/constants/routes'
import { Avatar } from '@/components/ui'
import { useNotificationsCount } from '@/hooks/useNotifications'
import { useInfosCount } from '@/hooks/useInfos'

export const NAV_GROUPS = [
  {
    key: 'principal',
    label: null,
    items: [
      { to: ROUTES.DASHBOARD,  icon: Home,          key: 'dashboard',   end: true },
      { to: '/commandes',      icon: ClipboardList, key: 'commandes'             },
      { to: '/clients',        icon: Users,         key: 'clients'               },
      { to: '/catalogue',      icon: Layers,        key: 'catalogue'             },
      { to: ROUTES.MA_VITRINE, icon: Store,         key: 'ma_vitrine', designerOnly: true },
    ],
  },
  {
    key: 'gestion',
    label: 'Gestion',
    items: [
      { to: '/equipe',          icon: Users2,   key: 'equipe'                     },
      { to: '/galerie',         icon: Images,   key: 'galerie'                    },
      { to: '/points',          icon: Star,     key: 'points'                     },
      { to: ROUTES.FACTURATION,      icon: FileText, key: 'facturation'                },
      { to: ROUTES.OUTILS_CREATIFS, icon: Palette,  key: 'outils_creatifs', designerOnly: true },
      { to: ROUTES.STUDIO,          icon: Sparkles, key: 'studio', designerOnly: true },
      { to: '/annonces',        icon: Megaphone, key: 'annonces', designerOnly: true },
      { to: '/caisse',          icon: Wallet,   key: 'caisse', proprietaire: true },
    ],
  },
  {
    key: 'systeme',
    label: 'Système',
    items: [
      { to: '/notifications', icon: Bell,       key: 'notifications'              },
      { to: ROUTES.INFOS,     icon: Megaphone,  key: 'infos'                      },
      { to: ROUTES.HISTORIQUE, icon: History,   key: 'historique'                 },
      { to: '/archives',      icon: Archive,    key: 'archives', proprietaire: true },
      { to: '/parametres',    icon: Settings,   key: 'parametres'                 },
      { to: '/support',       icon: HelpCircle, key: 'support'                    },
    ],
  },
]

/**
 * `badge` remplace l'ancien test `to === '/notifications'` : la pastille était
 * réservée à une entrée précise, et toute nouvelle entrée à compteur — comme
 * « Gextimo Infos » — aurait demandé un second cas particulier ici.
 */
function NavItem({ to, icon: Icon, navKey, end, badge = 0, t }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-dim hover:text-ink hover:bg-subtle',
      )}
    >
      {({ isActive }) => (
        <>
          {/* Barre d'accent gauche pour l'item actif */}
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
          )}

          <Icon
            size={18}
            strokeWidth={isActive ? 2.5 : 1.8}
            className="shrink-0"
          />
          <span className="flex-1 truncate">{t(`nav.${navKey}`)}</span>

          {badge > 0 && (
            <span className="text-2xs bg-danger text-inverse px-1.5 py-0.5 rounded-full font-semibold leading-none">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

/**
 * Position de défilement du menu, conservée d'une page à l'autre.
 *
 * Chaque page rend son propre `AppLayout` : la sidebar est donc DÉTRUITE puis
 * recréée à chaque navigation, et son défilement repartait de zéro — le menu
 * remontait tout seul dès qu'on cliquait sur une entrée du bas (constaté par la
 * direction, reproduit en QA le 20/07).
 *
 * La correction de fond serait de sortir la sidebar des pages, via une route de
 * mise en page qui ne se remonte pas. C'est une refonte qui touche les quarante
 * écrans : on mémorise ici la position, ce qui règle le symptôme sans risquer
 * une régression généralisée.
 *
 * En mémoire (pas en `sessionStorage`) : c'est un état d'affichage, il n'a
 * aucune raison de survivre à la fermeture de l'onglet.
 */
let defilementMenu = 0

export default function Sidebar() {
  const navRef = useRef(null)
  const { user, logout } = useAuth()
  const { isDesigner } = useAccountType()
  const navigate = useNavigate()
  const { data: notifCount = 0 } = useNotificationsCount()
  const { data: infosCount = 0 } = useInfosCount()

  // Une entrée sans compteur n'affiche pas de pastille : la table dit qui en a un.
  const badges = { '/notifications': notifCount, [ROUTES.INFOS]: infosCount }
  const { t } = useTranslation()

  // Restauration synchrone après montage : `useLayoutEffect` provoquerait un
  // avertissement au rendu serveur, et le décalage d'un `useEffect` est
  // imperceptible ici (le menu est déjà peint à sa position).
  useEffect(() => {
    if (navRef.current) navRef.current.scrollTop = defilementMenu
  }, [])

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-edge shrink-0 sticky top-0 h-screen">

      {/* Logo */}
      <div className="px-5 py-4 border-b border-edge shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Scissors size={16} className="text-inverse" />
          </div>
          <div className="min-w-0">
            <p className="font-bold font-display text-ink leading-tight">Gextimo</p>
            <p className="text-2xs text-ghost leading-tight mt-px">{t('nav.gestion_atelier')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav ref={navRef} onScroll={(e) => { defilementMenu = e.currentTarget.scrollTop }}
           className="flex-1 overflow-y-auto py-3 px-3 space-y-4 scrollbar-thin">
        {NAV_GROUPS.map(({ key, label, items }) => {
          const visible = items.filter(item =>
            (!item.proprietaire || user?.role === 'proprietaire') &&
            (!item.designerOnly || isDesigner),
          )
          if (visible.length === 0) return null

          return (
            <div key={key}>
              {label && (
                <p className="px-3 mb-1 text-2xs font-semibold text-ghost uppercase tracking-widest">
                  {label}
                </p>
              )}
              <div className="space-y-0.5">
                {visible.map(({ to, icon, key: navKey, end }) => (
                  <NavItem
                    key={to}
                    to={to}
                    icon={icon}
                    navKey={navKey}
                    end={end}
                    badge={badges[to] ?? 0}
                    t={t}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Pied de page — profil + déconnexion */}
      {user && (
        <div className="border-t border-edge p-3 shrink-0 space-y-0.5">
          <button
            type="button"
            onClick={() => navigate('/parametres/profil')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-subtle transition-colors"
          >
            <Avatar name={user.nom} src={user.avatar} size="sm" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-ink truncate">{user.nom}</p>
              <p className="text-xs text-ghost truncate capitalize">{user.role}</p>
            </div>
          </button>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-ghost hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            <span>{t('auth.deconnexion')}</span>
          </button>
        </div>
      )}
    </aside>
  )
}
