import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Home, Layers, CreditCard, MessageCircle,
  ShieldBan, ClipboardList, Bell, Star, LogOut,
  Sun, Moon, Monitor, Users, Wallet,
} from 'lucide-react'
import { useAdminAuth } from '@/contexts'
import { useTheme } from '@/contexts'
import { useAdminPaiements } from '@/hooks/admin/useAdminPaiements'
import { cn } from '@/utils/cn'

const PRINCIPAL = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard',   end: true  },
  { to: '/admin/ateliers',     icon: Home,            label: 'Ateliers'               },
  { to: '/admin/plans',        icon: Layers,          label: 'Plans'                  },
  { to: '/admin/transactions', icon: CreditCard,      label: 'Transactions'           },
  { to: '/admin/paiements',    icon: Wallet,          label: 'Paiements',  badge: true },
  { to: '/admin/tickets',      icon: MessageCircle,   label: 'Tickets'                },
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
      <p className="px-3 mb-1.5 text-2xs font-semibold uppercase tracking-widest text-admin-muted">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map(({ to, icon: Icon, label, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
              isActive
                ? 'bg-primary text-inverse font-medium'
                : 'text-admin-text hover:bg-admin-hover hover:text-admin-bright',
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="flex-1">{label}</span>
                {badge && badgeCount > 0 && (
                  <span className="min-w-4 h-4 bg-danger text-inverse text-2xs font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
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
      className="flex items-center gap-1.5 text-xs text-admin-muted hover:text-admin-bright transition-colors"
    >
      <Icon size={13} />
      <span>{resolvedTheme === 'dark' ? 'Mode sombre' : 'Mode clair'}</span>
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
    <aside className="w-56 shrink-0 bg-admin-surface text-admin-bright flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-inverse/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-inverse">CP</span>
        </div>
        <div>
          <p className="text-sm font-bold text-inverse leading-tight">CouturePro</p>
          <p className="text-xs text-admin-muted leading-tight">Espace admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5 scrollbar-none">
        <NavSection title="Principal" items={PRINCIPAL} badgeCount={paiementCount} />
        <NavSection title="Gestion"   items={gestionItems} />
      </nav>

      {/* Footer */}
      <div className="border-t border-inverse/5 px-4 py-3 space-y-3">
        <NavLink
          to="/admin/parametres"
          className={({ isActive }) => cn(
            'flex items-center gap-2.5 rounded-lg transition-colors',
            isActive ? 'text-primary-300' : 'text-admin-bright hover:text-inverse',
          )}
        >
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-inverse">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-inverse leading-tight truncate">
              {admin?.prenom} {admin?.nom}
            </p>
            <p className="text-xs text-admin-muted leading-tight truncate">{admin?.role}</p>
          </div>
        </NavLink>

        <div className="flex items-center justify-between">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className="text-admin-muted hover:text-danger transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
