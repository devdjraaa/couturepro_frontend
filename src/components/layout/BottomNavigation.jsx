import { NavLink } from 'react-router-dom'
import { Home, Users, ClipboardList, Scissors, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useNotificationsCount } from '@/hooks/useNotifications'
import { useCommandeStats } from '@/hooks/useCommandes'

const NAV_ITEMS = [
  { to: '/',           icon: Home,          label: 'Accueil',   end: true },
  { to: '/clients',    icon: Users,         label: 'Clients'             },
  { to: '/commandes',  icon: ClipboardList, label: 'Commandes'           },
  { to: '/catalogue',  icon: Scissors,      label: 'Catalogue'           },
  { to: '/parametres', icon: Settings,      label: 'Réglages'            },
]

export default function BottomNavigation() {
  const { data: notifCount = 0 }  = useNotificationsCount()
  const { data: cmdStats }        = useCommandeStats()
  const retardCount = cmdStats?.en_retard ?? 0

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-card border-t border-edge lg:hidden"
      style={{
        paddingBottom: 'var(--safe-area-bottom)',
        height: 'calc(var(--bottom-nav-height) + var(--safe-area-bottom))',
      }}
    >
      <div className="flex h-[var(--bottom-nav-height)]">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150',
              isActive ? 'text-primary' : 'text-ghost',
            )}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  {to === '/' && notifCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-4 h-4 bg-danger text-inverse text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                  {to === '/commandes' && retardCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-4 h-4 bg-danger text-inverse text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                      {retardCount > 9 ? '9+' : retardCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
