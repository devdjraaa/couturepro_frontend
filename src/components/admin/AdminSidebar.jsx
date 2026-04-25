import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, CreditCard, TicketCheck,
  Gift, ShieldBan, ClipboardList, Bell, Star, LogOut, Layers,
} from 'lucide-react'
import { useAdminAuth } from '@/contexts'

const NAV = [
  { to: '/admin',               icon: LayoutDashboard, label: 'Dashboard',     end: true },
  { to: '/admin/ateliers',      icon: Building2,       label: 'Ateliers'       },
  { to: '/admin/plans',         icon: Layers,          label: 'Plans'          },
  { to: '/admin/transactions',  icon: CreditCard,      label: 'Transactions'   },
  { to: '/admin/paiements',     icon: CreditCard,      label: 'Paiements'      },
  { to: '/admin/tickets',       icon: TicketCheck,     label: 'Tickets'        },
  { to: '/admin/offres',        icon: Star,            label: 'Offres spéc.'   },
  { to: '/admin/liste-noire',   icon: ShieldBan,       label: 'Liste noire'    },
  { to: '/admin/audit',         icon: ClipboardList,   label: 'Audit'          },
  { to: '/admin/notifications', icon: Bell,            label: 'Notifications'  },
]

export default function AdminSidebar() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <aside className="w-56 shrink-0 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-700">
        <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">CouturePro</p>
        <p className="text-xs text-gray-400 mt-0.5">Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Admin info + logout */}
      <div className="px-4 py-3 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate">{admin?.prenom} {admin?.nom}</p>
        <p className="text-xs text-gray-500 truncate mb-2">{admin?.role}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={13} /> Déconnexion
        </button>
      </div>
    </aside>
  )
}
