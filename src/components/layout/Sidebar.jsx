import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home, Users, ClipboardList, Scissors, Settings,
  Bell, Star, Users2, LogOut, HelpCircle, Archive, Wallet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts'
import { Avatar } from '@/components/ui'
import { useNotificationsCount } from '@/hooks/useNotifications'

const NAV_GROUPS = [
  {
    key: 'principal',
    label: null,
    items: [
      { to: '/',          icon: Home,          key: 'dashboard',   end: true },
      { to: '/clients',   icon: Users,         key: 'clients'               },
      { to: '/commandes', icon: ClipboardList, key: 'commandes'             },
      { to: '/catalogue', icon: Scissors,      key: 'catalogue'             },
    ],
  },
  {
    key: 'gestion',
    label: 'Gestion',
    items: [
      { to: '/equipe',  icon: Users2, key: 'equipe'                        },
      { to: '/points',  icon: Star,   key: 'points'                        },
      { to: '/caisse',  icon: Wallet, key: 'caisse', proprietaire: true    },
    ],
  },
  {
    key: 'systeme',
    label: 'Système',
    items: [
      { to: '/notifications', icon: Bell,       key: 'notifications'              },
      { to: '/archives',      icon: Archive,    key: 'archives', proprietaire: true },
      { to: '/parametres',    icon: Settings,   key: 'parametres'                 },
      { to: '/support',       icon: HelpCircle, key: 'support'                    },
    ],
  },
]

function NavItem({ to, icon: Icon, navKey, end, notifCount, t }) {
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

          {to === '/notifications' && notifCount > 0 && (
            <span className="text-2xs bg-danger text-inverse px-1.5 py-0.5 rounded-full font-semibold leading-none">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { data: notifCount = 0 } = useNotificationsCount()
  const { t } = useTranslation()

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-edge shrink-0 sticky top-0 h-screen">

      {/* Logo */}
      <div className="px-5 py-4 border-b border-edge shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Scissors size={16} className="text-inverse" />
          </div>
          <div className="min-w-0">
            <p className="font-bold font-display text-ink leading-tight">Couture Pro</p>
            <p className="text-2xs text-ghost leading-tight mt-px">Gestion d'atelier</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4 scrollbar-thin">
        {NAV_GROUPS.map(({ key, label, items }) => {
          const visible = items.filter(item => !item.proprietaire || user?.role === 'proprietaire')
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
                    notifCount={notifCount}
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
            onClick={() => navigate('/profil')}
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
