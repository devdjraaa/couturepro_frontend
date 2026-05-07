import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Home, Users, ClipboardList, Scissors, Settings,
  MoreHorizontal, X,
  Users2, Star, Wallet, Bell, Archive, HelpCircle, User as UserIcon, LogOut,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts'
import { useNotificationsCount } from '@/hooks/useNotifications'
import { useCommandeStats } from '@/hooks/useCommandes'

// 5 items principaux (visibles en permanence dans la bar)
const PRIMARY_ITEMS = [
  { to: '/',           icon: Home,          labelKey: 'dashboard',  end: true },
  { to: '/clients',    icon: Users,         labelKey: 'clients'              },
  { to: '/commandes',  icon: ClipboardList, labelKey: 'commandes'            },
  { to: '/catalogue',  icon: Scissors,      labelKey: 'catalogue'            },
  { to: '/parametres', icon: Settings,      labelKey: 'parametres'           },
]

// Items du menu overflow ("...") — reflète la sidebar desktop
const OVERFLOW_ITEMS = [
  { to: '/equipe',        icon: Users2,     labelKey: 'equipe'                            },
  { to: '/points',        icon: Star,       labelKey: 'points'                            },
  { to: '/caisse',        icon: Wallet,     labelKey: 'caisse',        proprietaire: true },
  { to: '/notifications', icon: Bell,       labelKey: 'notifications'                     },
  { to: '/archives',      icon: Archive,    labelKey: 'archives',      proprietaire: true },
  { to: '/support',       icon: HelpCircle, labelKey: 'support'                           },
  { to: '/profil',        icon: UserIcon,   labelKey: 'profil'                            },
]

function MoreSheet({ open, onClose }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { data: notifCount = 0 } = useNotificationsCount()

  if (!open) return null

  const visible = OVERFLOW_ITEMS.filter(it => !it.proprietaire || user?.role === 'proprietaire')

  const handleNavigate = (to) => {
    onClose()
    navigate(to)
  }

  const handleLogout = async () => {
    onClose()
    await logout()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-2xl shadow-2xl pb-safe lg:hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <p className="text-sm font-semibold text-ink">{t('nav.menu')}</p>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-subtle"
            aria-label={t('commun.fermer')}
          >
            <X size={16} className="text-dim" />
          </button>
        </div>

        <div className="px-3 pb-3 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {visible.map(({ to, icon: Icon, labelKey }) => (
              <button
                key={to}
                type="button"
                onClick={() => handleNavigate(to)}
                className="relative flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-subtle active:scale-95 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon size={18} className="text-primary" />
                </div>
                <span className="text-2xs font-medium text-ink text-center">
                  {t(`nav.${labelKey}`)}
                </span>
                {to === '/notifications' && notifCount > 0 && (
                  <span className="absolute top-2 right-2 min-w-4 h-4 bg-danger text-inverse text-2xs font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
            >
              <LogOut size={16} />
              <span>{t('auth.deconnexion')}</span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default function BottomNavigation() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: notifCount = 0 } = useNotificationsCount()
  const { data: cmdStats }       = useCommandeStats()
  const alertCount = (cmdStats?.en_retard ?? 0) + (cmdStats?.dans_48h ?? 0)

  // L'overflow "Plus" est actif si on est sur une route qui n'est pas dans PRIMARY
  const overflowRoutes = OVERFLOW_ITEMS.map(it => it.to)
  const isOnOverflowRoute = overflowRoutes.some(r => location.pathname.startsWith(r))

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur-sm border-t border-edge lg:hidden bottom-nav-container">
        <div className="flex h-bottom-nav">
          {PRIMARY_ITEMS.map(({ to, icon: Icon, labelKey, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 min-w-0 px-1',
                isActive ? 'text-primary' : 'text-ghost',
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    'relative flex items-center justify-center w-10 h-7 rounded-2xl transition-all duration-200',
                    isActive && 'bg-primary/10',
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

                  <span className="text-[10px] font-medium truncate max-w-full">
                    {t(`nav.${labelKey}`)}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* Bouton "Plus" — overflow menu */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 min-w-0 px-1',
              moreOpen || isOnOverflowRoute ? 'text-primary' : 'text-ghost',
            )}
            aria-label={t('nav.plus')}
          >
            <div className={cn(
              'relative flex items-center justify-center w-10 h-7 rounded-2xl transition-all duration-200',
              (moreOpen || isOnOverflowRoute) && 'bg-primary/10',
            )}>
              <MoreHorizontal size={20} strokeWidth={moreOpen || isOnOverflowRoute ? 2.5 : 1.8} />
            </div>
            <span className="text-[10px] font-medium">{t('nav.plus')}</span>
          </button>
        </div>
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  )
}
