import { useLocation, useNavigate, NavLink } from 'react-router-dom'
import { Home, ClipboardList, Users, Plus, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { useNotificationsCount } from '@/hooks/useNotifications'
import { useCommandeStats } from '@/hooks/useCommandes'

// #45-46 — "Paramètres" remplace "Catalogue" pour rendre l'abonnement accessible
const NAV_ITEMS = [
  { to: '/',           icon: Home,          tKey: 'nav.dashboard',  end: true  },
  { to: '/commandes',  icon: ClipboardList, tKey: 'nav.commandes'              },
  null, // slot FAB central
  { to: '/clients',    icon: Users,         tKey: 'nav.clients'                },
  { to: '/parametres', icon: Settings,      tKey: 'nav.parametres'             },
]

const FAB_ACTIONS = {
  '/':           '/commandes/new',
  '/commandes':  '/commandes/new',
  '/clients':    '/clients',
  '/catalogue':  '/catalogue',
}

function getFABTarget(pathname) {
  if (pathname.startsWith('/commandes')) return '/commandes/new'
  if (pathname.startsWith('/clients'))   return '/clients'
  if (pathname.startsWith('/catalogue')) return '/catalogue/modeles'
  return '/commandes/new'
}

export default function BottomNavigation() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { t } = useTranslation()
  const { data: notifCount = 0 } = useNotificationsCount()
  const { data: cmdStats }       = useCommandeStats()
  const alertCount = (cmdStats?.en_retard ?? 0) + (cmdStats?.dans_48h ?? 0)

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur-sm border-t border-edge lg:hidden bottom-nav-container">
      <div className="flex items-center h-bottom-nav">
        {NAV_ITEMS.map((item, i) => {
          if (!item) {
            return (
              <div key="fab" className="flex-1 flex items-center justify-center">
                <button
                  type="button"
                  aria-label={t('commun.nouveau')}
                  onClick={() => navigate(getFABTarget(location.pathname))}
                  className="w-14 h-14 -mt-5 rounded-full bg-primary text-inverse flex items-center justify-center shadow-lg shadow-primary/40 hover:bg-primary-600 hover:shadow-xl active:scale-[0.92] active:shadow-sm transition-all duration-150"
                >
                  <Plus size={22} strokeWidth={2.5} />
                </button>
              </div>
            )
          }

          const { to, icon: Icon, tKey, end } = item
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 active:scale-[0.88]',
                isActive ? 'text-primary' : 'text-ghost',
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    'relative flex items-center justify-center w-12 h-7 rounded-2xl transition-all duration-300 ease-spring',
                    isActive ? 'bg-primary/10 scale-105' : 'scale-100',
                  )}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    {to === '/' && notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-danger text-inverse text-2xs font-bold rounded-full flex items-center justify-center px-1 leading-none">
                        {notifCount > 9 ? '9+' : notifCount}
                      </span>
                    )}
                    {to === '/commandes' && alertCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-danger text-inverse text-2xs font-bold rounded-full flex items-center justify-center px-1 leading-none">
                        {alertCount > 9 ? '9+' : alertCount}
                      </span>
                    )}
                  </div>
                  <span className={cn('text-2xs font-medium', isActive && 'font-semibold')}>{t(tKey)}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
