import { Scissors } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function AuthLayout({ children, subtitle, className }) {
  return (
    <div className="min-h-dvh bg-app flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
          <Scissors size={20} className="text-inverse" />
        </div>
        <div>
          <p className="text-lg font-bold font-display text-ink leading-none">Couture Pro</p>
          {subtitle && <p className="text-xs text-ghost mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Card */}
      <div className={cn(
        'w-full max-w-sm bg-card rounded-2xl border border-edge shadow-sm p-6',
        className,
      )}>
        {children}
      </div>
    </div>
  )
}
