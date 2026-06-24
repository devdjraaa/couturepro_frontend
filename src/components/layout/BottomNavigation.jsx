import { useState } from 'react'
import { useLocation, useNavigate, NavLink } from 'react-router-dom'
import { Home, ClipboardList, Users, Plus, Settings, Layers, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { BottomSheet } from '@/components/ui'
import { useNotificationsCount } from '@/hooks/useNotifications'
import { useCommandeStats } from '@/hooks/useCommandes'
import { ROUTES } from '@/constants/routes'

// #45-46 — "Paramètres" remplace "Catalogue" pour rendre l'abonnement accessible
const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, icon: Home,          tKey: 'nav.dashboard',  end: true  },
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
  const [showNewSheet, setShowNewSheet] = useState(false)

  const handleFabClick = () => {
    const target = getFABTarget(location.pathname)
    if (target === '/commandes/new') {
      setShowNewSheet(true)
      return
    }
    navigate(target)
  }

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
                  onClick={handleFabClick}
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

      <BottomSheet
        isOpen={showNewSheet}
        onClose={() => setShowNewSheet(false)}
        title={t('commandes.action_sheet.titre')}
      >
        <div className="p-2 pb-[calc(0.5rem+var(--safe-area-bottom))]">
          <button
            type="button"
            onClick={() => { setShowNewSheet(false); navigate('/commandes/new') }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-subtle transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ClipboardList size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">{t('commandes.action_sheet.simple')}</p>
              <p className="text-xs text-ghost">{t('commandes.action_sheet.simple_desc')}</p>
            </div>
            <ChevronRight size={16} className="text-ghost shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => { setShowNewSheet(false); navigate('/commandes/groupes/nouveau') }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-subtle transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Layers size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">{t('commandes.action_sheet.groupee')}</p>
              <p className="text-xs text-ghost">{t('commandes.action_sheet.groupee_desc')}</p>
            </div>
            <ChevronRight size={16} className="text-ghost shrink-0" />
          </button>
        </div>
      </BottomSheet>
    </nav>
  )
}
