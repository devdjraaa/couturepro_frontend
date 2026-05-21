import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNavigation from './BottomNavigation'
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate'
import { GlobalSearch } from '@/components/ui'

function ExpiryBanner() {
  const navigate = useNavigate()
  const { statut, daysLeft } = useSubscriptionGate()

  if (statut !== 'essai' || daysLeft === null || daysLeft > 5) return null

  const label = daysLeft <= 1 ? 'expire aujourd\'hui' : `expire dans ${daysLeft} jour(s)`

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 bg-warning/10 border-b border-warning/30 text-sm text-warning cursor-pointer"
      onClick={() => navigate('/parametres')}
    >
      <AlertTriangle size={14} className="shrink-0" />
      <span>Votre période d'essai {label}. <span className="underline font-medium">Choisir un plan →</span></span>
    </div>
  )
}

export default function AppLayout({
  title,
  showBack = false,
  onBack,
  rightAction,
  noPadding = false,
  noMobileHeader = false,
  className,
  children,
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-dvh bg-app overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ExpiryBanner />
        <div className={noMobileHeader ? 'hidden lg:block' : ''}>
          <Header
            title={title}
            showBack={showBack}
            onBack={onBack}
            rightAction={rightAction}
            onSearch={() => setSearchOpen(true)}
          />
        </div>

        <main
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden',
            !noPadding && 'pb-safe lg:pb-0',
            className,
          )}
        >
          <div key={location.pathname} className="animate-page-enter">
            {children}
          </div>
        </main>
      </div>

      <BottomNavigation />

      {searchOpen && <GlobalSearch isOpen onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
