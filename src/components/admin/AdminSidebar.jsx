import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Home, Layers, CreditCard, MessageCircle,
  ShieldBan, ClipboardList, Bell, Star, LogOut,
  Sun, Moon, Monitor, Users, Wallet, X, Flag, Megaphone, TicketPercent, Activity, Palette, BarChart3, Images,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminAuth, useTheme } from '@/contexts'
import { LanguageSwitcher } from '@/components/ui'
import { useAdminPaiements } from '@/hooks/admin/useAdminPaiements'
import { cn } from '@/utils/cn'

const PRINCIPAL = [
  { to: '/admin',              icon: LayoutDashboard, tKey: 'admin.nav.dashboard',    end: true  },
  { to: '/admin/ateliers',     icon: Home,            tKey: 'admin.nav.ateliers'                },
  { to: '/admin/plans',        icon: Layers,          tKey: 'admin.nav.plans'                   },
  { to: '/admin/transactions', icon: CreditCard,      tKey: 'admin.nav.transactions'            },
  { to: '/admin/paiements',    icon: Wallet,          tKey: 'admin.nav.paiements',  badge: true },
  { to: '/admin/tickets',      icon: MessageCircle,   tKey: 'admin.nav.tickets'                 },
]

const GESTION = [
  { to: '/admin/offres',        icon: Star,          tKey: 'admin.nav.offres'        },
  { to: '/admin/codes-promo',   icon: TicketPercent, tKey: 'admin.nav.codes_promo'   },
  { to: '/admin/signalements',  icon: Flag,          tKey: 'admin.nav.signalements'  },
  { to: '/admin/realisations',  icon: Images,        tKey: 'admin.nav.realisations'  },
  { to: '/admin/banniere',      icon: Megaphone,     tKey: 'admin.nav.banniere'      },
  { to: '/admin/analytique',    icon: BarChart3,     tKey: 'admin.nav.analytique'    },
  { to: '/admin/reglages-vitrine', icon: Palette,    tKey: 'admin.nav.reglages_vitrine' },
  { to: '/admin/liste-noire',   icon: ShieldBan,     tKey: 'admin.nav.liste_noire'   },
  { to: '/admin/audit',         icon: ClipboardList, tKey: 'admin.nav.audit'         },
  { to: '/admin/notifications', icon: Bell,          tKey: 'admin.nav.notifications' },
  { to: '/admin/infos',         icon: Megaphone,      tKey: 'admin.nav.infos' },
  { to: '/admin/diagnostic',    icon: Activity,      tKey: 'admin.nav.diagnostic'    },
]

const SUPER_ADMIN = [
  { to: '/admin/admins', icon: Users, tKey: 'admin.nav.admins' },
]

function NavSection({ title, items, badgeCount = 0, onNav }) {
  const { t } = useTranslation()
  return (
    <div>
      <p className="px-3 mb-1.5 text-2xs font-semibold uppercase tracking-widest text-admin-muted">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map(({ to, icon: Icon, tKey, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNav}
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
                <span className="flex-1">{t(tKey)}</span>
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
  const { t } = useTranslation()
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor
  const nextKey = theme === 'light'
    ? 'admin.parametres.theme_sombre'
    : theme === 'dark'
      ? 'admin.parametres.theme_systeme'
      : 'admin.parametres.theme_clair'

  return (
    <button
      onClick={toggleTheme}
      title={t('admin.nav.passer_mode', { mode: t(nextKey) })}
      className="flex items-center gap-1.5 text-xs text-admin-muted hover:text-admin-bright transition-colors"
    >
      <Icon size={13} />
      <span>{t(resolvedTheme === 'dark' ? 'admin.nav.mode_sombre' : 'admin.nav.mode_clair')}</span>
    </button>
  )
}

export default function AdminSidebar({ isOpen, onClose }) {
  const { t } = useTranslation()
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
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-56 bg-admin-surface text-admin-bright flex flex-col transition-transform duration-300 ease-in-out',
        'md:static md:translate-x-0 md:h-screen md:shrink-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Logo */}
        <div className="px-4 py-4 border-b border-inverse/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-inverse">CP</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-inverse leading-tight">Gextimo</p>
            <p className="text-xs text-admin-muted leading-tight">{t('admin.nav.sidebar_subtitle')}</p>
          </div>
          {/* Fermer — mobile uniquement */}
          <button
            onClick={onClose}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg text-admin-muted hover:text-inverse transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5 scrollbar-none">
          <NavSection title={t('admin.nav.section_principal')} items={PRINCIPAL} badgeCount={paiementCount} onNav={onClose} />
          <NavSection title={t('admin.nav.section_gestion')}   items={gestionItems} onNav={onClose} />
        </nav>

        {/* Footer */}
        <div className="border-t border-inverse/5 px-4 py-3 space-y-3">
          <NavLink
            to="/admin/parametres"
            onClick={onClose}
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
            <LanguageSwitcher variant="hero" />
            <button
              onClick={handleLogout}
              title={t('auth.deconnexion')}
              className="text-admin-muted hover:text-danger transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
