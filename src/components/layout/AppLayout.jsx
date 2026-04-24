import { cn } from '@/utils/cn'
import SyncIndicator from './SyncIndicator'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNavigation from './BottomNavigation'

export default function AppLayout({
  title,
  showBack = false,
  onBack,
  rightAction,
  noPadding = false,
  className,
  children,
}) {
  return (
    <div className="flex h-dvh bg-app overflow-hidden">
      <SyncIndicator />
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          showBack={showBack}
          onBack={onBack}
          rightAction={rightAction}
        />

        <main
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden',
            !noPadding && 'pb-safe lg:pb-0',
            className,
          )}
        >
          {children}
        </main>
      </div>

      <BottomNavigation />
    </div>
  )
}
