import { useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw, Ban } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNavigation from './BottomNavigation'
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate'
import { GlobalSearch } from '@/components/ui'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { usePointsToast } from '@/hooks/usePoints'
import { useAuth } from '@/contexts'
import { ROUTES } from '@/constants/routes'
import { initPush } from '@/utils/push'

function ExpiryBanner() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { statut, daysLeft } = useSubscriptionGate()

  if (statut !== 'essai' || daysLeft === null || daysLeft > 5) return null

  const label = daysLeft <= 1
    ? t('abonnement.banniere.expire_auj')
    : t('abonnement.banniere.expire_dans', { jours: daysLeft })

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 bg-warning/10 border-b border-warning/30 text-sm text-warning cursor-pointer"
      onClick={() => navigate('/parametres')}
    >
      <AlertTriangle size={14} className="shrink-0" />
      <span>{t('abonnement.banniere.texte', { label })} <span className="underline font-medium">{t('abonnement.banniere.action')}</span></span>
    </div>
  )
}

function AccountStatusBanner() {
  const { t } = useTranslation()
  const { atelier } = useAuth()
  const navigate = useNavigate()

  if (!atelier) return null

  // P156 : abonnement expiré → mode gratuit (bannière persistante, invite à renouveler).
  if (atelier.statut === 'expire') {
    return (
      <div
        className="flex items-center gap-2 px-4 pb-2 bg-warning/10 border-b border-warning/30 text-sm text-warning cursor-pointer"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
        onClick={() => navigate('/parametres?tab=abonnement')}
      >
        <Ban size={14} className="shrink-0" />
        <span>{t('abonnement.banniere.mode_gratuit')} <span className="underline font-medium">{t('abonnement.banniere.renouveler')}</span></span>
      </div>
    )
  }

  // statut réel de l'atelier : 'actif' | 'essai' | 'expire' | 'gele'.
  // 'gele' = compte suspendu (action admin, ou blocage auto sur récidive de signalements).
  if (atelier.statut === 'gele') {
    return (
      <div
        className="flex items-center gap-2 px-4 pb-2 bg-danger/10 border-b border-danger/30 text-sm text-danger cursor-pointer"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
        onClick={() => navigate('/support')}
      >
        <Ban size={14} className="shrink-0" />
        <span>{t('commun.compte_suspendu')}<span className="underline font-medium">{t('commun.contacter_support')}</span></span>
      </div>
    )
  }

  return null
}

export default function AppLayout({
  title,
  showBack,         // undefined = auto (toutes pages sauf dashboard) ; true/false = explicite
  onBack,
  rightAction,
  noPadding = false,
  noMobileHeader = false,
  noAnimation = false,
  className,
  onRefresh,
  children,
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const autoShowBack = showBack !== undefined ? showBack : location.pathname !== ROUTES.DASHBOARD
  const { containerRef, pullY, refreshing, threshold } = usePullToRefresh(onRefresh)
  usePointsToast() // P39 : toast « +X pts » quand le solde de fidélité augmente

  // Enregistrement push FCM (zone authentifiée → le token est lié à l'utilisateur).
  useEffect(() => { initPush() }, [])

  return (
    <div className="flex h-dvh bg-app overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AccountStatusBanner />
        <ExpiryBanner />
        <div className={noMobileHeader ? 'hidden lg:block' : ''}>
          <Header
            title={title}
            showBack={autoShowBack}
            onBack={onBack}
            rightAction={rightAction}
          />
        </div>

        <main
          ref={containerRef}
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden',
            onRefresh && 'overscroll-y-none',
            !noPadding && 'pb-safe lg:pb-0',
            className,
          )}
        >
          {onRefresh && (
            <div
              className="flex justify-center overflow-hidden"
              style={{
                height: pullY,
                transition: pullY === 0 ? 'height 300ms cubic-bezier(0.4,0,0.2,1)' : 'none',
              }}
            >
              <div className="flex items-end pb-2">
                <div className={cn(
                  'w-9 h-9 rounded-full border-2 bg-card shadow-sm flex items-center justify-center',
                  pullY >= threshold || refreshing ? 'border-primary/40' : 'border-edge',
                )}>
                  <RefreshCw
                    size={15}
                    className={cn(
                      pullY >= threshold || refreshing ? 'text-primary' : 'text-ghost',
                      refreshing && 'animate-spin',
                    )}
                    style={!refreshing ? { transform: `rotate(${Math.min(pullY / threshold, 1) * 360}deg)` } : undefined}
                  />
                </div>
              </div>
            </div>
          )}
          {/* #11 — noAnimation désactive la transition sur les pages de saisie */}
          <div key={location.pathname} className={noAnimation ? undefined : 'animate-page-enter'}>
            {children}
          </div>
        </main>
      </div>

      <BottomNavigation />

      {searchOpen && <GlobalSearch isOpen onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
