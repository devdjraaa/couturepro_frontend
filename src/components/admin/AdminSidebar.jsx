import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, CreditCard, TicketCheck,
  ShieldBan, ClipboardList, Bell, Star, LogOut, Layers,
  Settings, Sun, Moon, Monitor, Users,
} from 'lucide-react'
import { useAdminAuth } from '@/contexts'
import { useTheme } from '@/contexts'
import { useAdminPaiements } from '@/hooks/admin/useAdminPaiements'
import { cn } from '@/utils/cn'

const PRINCIPAL = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard',   end: true  },
  { to: '/admin/ateliers',     icon: Building2,       label: 'Ateliers'               },
  { to: '/admin/plans',        icon: Layers,          label: 'Plans'                  },
  { to: '/admin/transactions', icon: CreditCard,      label: 'Transactions'           },
  { to: '/admin/paiements',    icon: CreditCard,      label: 'Paiements',  badge: true },
  { to: '/admin/tickets',      icon: TicketCheck,     label: 'Tickets'                },
]

const GESTION = [
  { to: '/admin/offres',        icon: Star,          label: 'Offres spéciales' },
  { to: '/admin/liste-noire',   icon: ShieldBan,     label: 'Liste noire'      },
  { to: '/admin/audit',         icon: ClipboardList, label: 'Audit'            },
  { to: '/admin/notifications', icon: Bell,          label: 'Notifications'    },
]

const SUPER_ADMIN = [
  { to: '/admin/admins', icon: Users, label: 'Admins' },
]

function NavSection({ title, items, badgeCount = 0 }) {
  return (
    <div>
      <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
        {title}
      </p>
      {items.map(({ to, icon: Icon, label, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
            isActive
              ? 'bg-indigo-600 text-white font-medium'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white',
          )}
        >
          <Icon size={15} />
          <span className="flex-1">{label}</span>
          {badge && badgeCount > 0 && (
            <span className="min-w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme, resolvedTheme } = useTheme()
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor
  const next = theme === 'light' ? 'Sombre' : theme === 'dark' ? 'Système' : 'Clair'

  return (
    <button
      onClick={toggleTheme}
      title={`Passer en mode ${next}`}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
    >
      <Icon size={13} />
      {resolvedTheme === 'dark' ? 'Mode sombre' : 'Mode clair'}
    </button>
  )
}

export default function AdminSidebar() {
  const { admin, logout, isSuperAdmin } = useAdminAuth()
  const navigate = useNavigate()
  const { data: paiements } = useAdminPaiements({ statut: 'pending' })
  const paiementCount = paiements?.total ?? 0

  const initials = [admin?.prenom, admin?.nom]
    .filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'A'

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const gestionItems = [...GESTION, ...(isSuperAdmin ? SUPER_ADMIN : [])]

  return (
    <aside className="w-56 shrink-0 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-700/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white">CP</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">CouturePro</p>
          <p className="text-[10px] text-gray-400 leading-tight">Espace admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        <NavSection title="Principal" items={PRINCIPAL} badgeCount={paiementCount} />
        <NavSection title="Gestion"   items={gestionItems} />
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-700/60 space-y-2.5">
        <NavLink
          to="/admin/parametres"
          className={({ isActive }) => cn(
            'flex items-center gap-2.5 transition-colors',
            isActive ? 'text-indigo-400' : 'text-gray-300 hover:text-white',
          )}
        >
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{admin?.prenom} {admin?.nom}</p>
            <p className="text-[10px] text-gray-500 truncate">{admin?.role}</p>
          </div>
        </NavLink>
        <div className="flex items-center justify-between pl-0.5">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className="text-gray-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}
