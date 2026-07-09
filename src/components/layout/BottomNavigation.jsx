import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { Home, ClipboardList, Users, Plus, Menu, Layers, UserPlus, Shirt, Wallet, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { BottomSheet } from '@/components/ui'
import { useNotificationsCount } from '@/hooks/useNotifications'
import { useCommandeStats } from '@/hooks/useCommandes'
import { ROUTES } from '@/constants/routes'
import MobileMenu from './MobileMenu'

// Barre du bas : Accueil · Commandes · [+ créer] · Clients · Plus (menu complet)
const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, icon: Home,          tKey: 'nav.dashboard',  end: true  },
  { to: '/commandes',  icon: ClipboardList, tKey: 'nav.commandes'              },
  null, // slot FAB central (créer)
  { to: '/clients',    icon: Users,         tKey: 'nav.clients'                },
  { menu: true,        icon: Menu,          tKey: 'nav.plus'                   }, // ouvre le menu complet
]

export default function BottomNavigation() {
  const navigate  = useNavigate()
  const { t } = useTranslation()
  const { data: notifCount = 0 } = useNotificationsCount()
  const { data: cmdStats }       = useCommandeStats()
  const alertCount = (cmdStats?.en_retard ?? 0) + (cmdStats?.dans_48h ?? 0)
  const [showNewSheet, setShowNewSheet] = useState(false)
  const [showMenu,     setShowMenu]     = useState(false)

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-card/80 backdrop-blur-[18px] border-t border-edge lg:hidden bottom-nav-container">
      <div className="flex items-center h-bottom-nav">
        {NAV_ITEMS.map((item, i) => {
          if (!item) {
            return (
              <div key="fab" className="flex-1 flex items-center justify-center">
                <button
                  type="button"
                  aria-label={t('commun.nouveau')}
                  onClick={() => setShowNewSheet(true)}
                  className="w-14 h-14 -mt-5 rounded-[21px] btn-primary-couture text-white flex items-center justify-center active:scale-[0.92] transition-all duration-150"
                  style={{ boxShadow: '0 0 0 6px var(--color-bg-app), 0 18px 36px -12px rgba(180,20,10,.60)' }}
                >
                  <Plus size={22} strokeWidth={2.5} />
                </button>
              </div>
            )
          }

          if (item.menu) {
            const { icon: Icon, tKey } = item
            return (
              <button
                key="menu"
                type="button"
                onClick={() => setShowMenu(true)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 text-ghost active:scale-[0.88] transition-all duration-150"
              >
                <div className="flex items-center justify-center w-12 h-7 rounded-2xl">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <span className="text-2xs font-medium">{t(tKey)}</span>
              </button>
            )
          }

          const { to, icon: Icon, tKey, end } = item
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 active:scale-[0.88]',
                isActive ? 'text-[var(--color-red-hi)]' : 'text-ghost',
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    'relative flex items-center justify-center w-12 h-7 rounded-2xl transition-all duration-300 ease-spring',
                    isActive ? 'bg-[var(--color-primary-50)] scale-105' : 'scale-100',
                  )}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
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
                  <span className={cn('text-2xs font-medium', isActive && 'font-semibold')}>{t(tKey)}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>

      <BottomSheet
        isOpen={showNewSheet}
        onClose={() => setShowNewSheet(false)}
        title={t('commandes.action_sheet.titre')}
      >
        <div className="p-2 pb-[calc(0.5rem+var(--safe-area-bottom))]">
          <button
            type="button"
            onClick={() => { setShowNewSheet(false); navigate('/commandes/new') }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-subtle transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ClipboardList size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">{t('commandes.action_sheet.simple')}</p>
              <p className="text-xs text-ghost">{t('commandes.action_sheet.simple_desc')}</p>
            </div>
            <ChevronRight size={16} className="text-ghost shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => { setShowNewSheet(false); navigate('/commandes/groupes/nouveau') }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-subtle transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Layers size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">{t('commandes.action_sheet.groupee')}</p>
              <p className="text-xs text-ghost">{t('commandes.action_sheet.groupee_desc')}</p>
            </div>
            <ChevronRight size={16} className="text-ghost shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => { setShowNewSheet(false); navigate('/clients') }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-subtle transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <UserPlus size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">{t('commandes.action_sheet.client')}</p>
              <p className="text-xs text-ghost">{t('commandes.action_sheet.client_desc')}</p>
            </div>
            <ChevronRight size={16} className="text-ghost shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => { setShowNewSheet(false); navigate('/catalogue/modeles') }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-subtle transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
              <Shirt size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">{t('commandes.action_sheet.modele')}</p>
              <p className="text-xs text-ghost">{t('commandes.action_sheet.modele_desc')}</p>
            </div>
            <ChevronRight size={16} className="text-ghost shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => { setShowNewSheet(false); navigate('/caisse') }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-subtle transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold-dark flex items-center justify-center shrink-0">
              <Wallet size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">{t('commandes.action_sheet.encaisser')}</p>
              <p className="text-xs text-ghost">{t('commandes.action_sheet.encaisser_desc')}</p>
            </div>
            <ChevronRight size={16} className="text-ghost shrink-0" />
          </button>
        </div>
      </BottomSheet>

      <MobileMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </nav>
  )
}
