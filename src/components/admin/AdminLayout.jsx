import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Bell, Settings, Menu, ArrowLeft } from 'lucide-react'
import AdminSidebar from './AdminSidebar'

const ROUTE_KEYS = {
  '/admin':               'admin.nav.dashboard',
  '/admin/ateliers':      'admin.nav.ateliers',
  '/admin/plans':         'admin.nav.plans',
  '/admin/transactions':  'admin.nav.transactions',
  '/admin/paiements':     'admin.nav.paiements',
  '/admin/tickets':       'admin.nav.tickets',
  '/admin/offres':        'admin.nav.offres',
  '/admin/liste-noire':   'admin.nav.liste_noire',
  '/admin/audit':         'admin.nav.audit',
  '/admin/notifications': 'admin.nav.notifications',
  '/admin/admins':        'admin.nav.admins',
  '/admin/parametres':    'admin.nav.parametres',
}

export default function AdminLayout({ children, title, action }) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pageTitle = title ?? t(ROUTE_KEYS[location.pathname] ?? 'admin.nav.dashboard')
  const isRoot = location.pathname === '/admin'

  return (
    <div className="flex h-screen overflow-hidden bg-app">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-edge px-4 md:px-8 py-3 md:py-4 flex items-center gap-3 shrink-0 z-10">
          {/* Hamburger — mobile uniquement */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-ghost hover:bg-subtle hover:text-ink transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>

          {/* Bouton retour — toutes les pages sauf le dashboard racine */}
          {!isRoot && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label={t('commun.retour')}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-ghost hover:bg-subtle hover:text-ink transition-colors shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-2xs text-ghost mb-0.5 hidden sm:block">
              {t('commun.accueil')} / <span className="text-dim">{pageTitle}</span>
            </p>
            <h1 className="text-base md:text-lg font-semibold font-display text-ink leading-tight truncate">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            {/* Search — desktop uniquement */}
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost pointer-events-none" />
              <input
                type="search"
                placeholder={t('admin.nav.rechercher')}
                className="h-9 w-48 bg-subtle border border-edge rounded-xl pl-8 pr-3 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary [&::-webkit-search-cancel-button]:hidden"
              />
            </div>

            <button
              type="button"
              onClick={() => navigate('/admin/notifications')}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-ghost hover:bg-subtle hover:text-ink transition-colors"
            >
              <Bell size={17} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/parametres')}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl text-ghost hover:bg-subtle hover:text-ink transition-colors"
            >
              <Settings size={17} />
            </button>

            {action}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
