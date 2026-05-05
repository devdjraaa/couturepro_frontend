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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex items-center gap-4 sticky top-0 z-10">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">
              Accueil / <span className="text-gray-500">{pageTitle}</span>
            </p>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 leading-tight">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Rechercher…"
                className="h-9 w-48 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-8 pr-3 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 [&::-webkit-search-cancel-button]:hidden"
              />
            </div>

            {/* Bell */}
            <button
              type="button"
              onClick={() => navigate('/admin/notifications')}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bell size={17} />
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => navigate('/admin/parametres')}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings size={17} />
            </button>

            {/* Action slot */}
            {action !== undefined ? action : (
              <button
                type="button"
                className="flex items-center gap-1.5 h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 rounded-lg transition-colors"
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
