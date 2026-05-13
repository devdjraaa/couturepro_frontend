import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, Settings, Plus } from 'lucide-react'
import AdminSidebar from './AdminSidebar'

const ROUTE_LABELS = {
  '/admin':               'Dashboard',
  '/admin/ateliers':      'Ateliers',
  '/admin/plans':         'Plans',
  '/admin/transactions':  'Transactions',
  '/admin/paiements':     'Paiements',
  '/admin/tickets':       'Tickets',
  '/admin/offres':        'Offres spéciales',
  '/admin/liste-noire':   'Liste noire',
  '/admin/audit':         'Audit',
  '/admin/notifications': 'Notifications',
  '/admin/admins':        'Admins',
  '/admin/parametres':    'Paramètres',
}

export default function AdminLayout({ children, title, action }) {
  const location = useLocation()
  const navigate = useNavigate()
  const pageTitle = title ?? ROUTE_LABELS[location.pathname] ?? 'Admin'

  return (
    <div className="flex min-h-screen bg-app">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-edge px-8 py-4 flex items-center gap-4 sticky top-0 z-10">
          <div className="flex-1 min-w-0">
            <p className="text-2xs text-ghost mb-0.5">
              Accueil / <span className="text-dim">{pageTitle}</span>
            </p>
            <h1 className="text-lg font-semibold font-display text-ink leading-tight">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost pointer-events-none" />
              <input
                type="search"
                placeholder="Rechercher…"
                className="h-9 w-48 bg-subtle border border-edge rounded-xl pl-8 pr-3 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary [&::-webkit-search-cancel-button]:hidden"
              />
            </div>

            {/* Bell */}
            <button
              type="button"
              onClick={() => navigate('/admin/notifications')}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-ghost hover:bg-subtle hover:text-ink transition-colors"
            >
              <Bell size={17} />
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => navigate('/admin/parametres')}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-ghost hover:bg-subtle hover:text-ink transition-colors"
            >
              <Settings size={17} />
            </button>

            {/* Action slot */}
            {action !== undefined ? action : (
              <button
                type="button"
                className="flex items-center gap-1.5 h-9 bg-primary hover:bg-primary-600 text-inverse text-sm font-medium px-4 rounded-xl transition-colors"
              >
                <Plus size={15} />
                Nouvelle action
              </button>
            )}
          </div>
        </header>

        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}
