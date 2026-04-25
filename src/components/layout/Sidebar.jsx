import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Users, ClipboardList, Scissors, Settings, Bell, Star, Users2, LogOut, HelpCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts'
import { Avatar } from '@/components/ui'
import { useNotificationsCount } from '@/hooks/useNotifications'

const NAV_ITEMS = [
  { to: '/',              icon: Home,          label: 'Tableau de bord', end: true },
  { to: '/clients',       icon: Users,         label: 'Clients'                   },
  { to: '/commandes',     icon: ClipboardList, label: 'Commandes'                 },
  { to: '/catalogue',     icon: Scissors,      label: 'Catalogue'                 },
  { to: '/equipe',        icon: Users2,        label: 'Équipe'                    },
  { to: '/points',        icon: Star,          label: 'Fidélité'                  },
  { to: '/notifications', icon: Bell,          label: 'Notifications'             },
  { to: '/parametres',    icon: Settings,      label: 'Paramètres'                },
  { to: '/support',       icon: HelpCircle,    label: 'Support'                   },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { data: notifCount = 0 } = useNotificationsCount()

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-card border-r border-edge shrink-0 sticky top-0 h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-edge shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Scissors size={14} className="text-inverse" />
        </div>
        <span className="font-bold font-display text-ink">Couture Pro</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-dim hover:text-ink hover:bg-subtle',
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} className="shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                {to === '/notifications' && notifCount > 0 && (
                  <span className="text-xs bg-danger text-inverse px-1.5 py-0.5 rounded-full font-semibold leading-none">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      {user && (
        <div className="border-t border-edge p-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/profil')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-subtle transition-colors"
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
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-ghost hover:text-danger hover:bg-danger/10 transition-colors mt-1"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </aside>
  )
}
