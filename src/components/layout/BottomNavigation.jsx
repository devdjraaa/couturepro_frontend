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
  const alertCount = (cmdStats?.en_retard ?? 0) + (cmdStats?.dans_48h ?? 0)

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur-sm border-t border-edge lg:hidden bottom-nav-container">
      <div className="flex h-bottom-nav">
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
                {/* Zone icône avec indicateur pill actif */}
                <div className={cn(
                  'relative flex items-center justify-center w-12 h-8 rounded-2xl transition-all duration-200',
                  isActive && 'bg-primary/10',
                )}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />

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

                <span className="text-2xs font-medium">{label}</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-primary" />}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
