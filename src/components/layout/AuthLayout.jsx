import { Scissors } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function AuthLayout({ children, subtitle, className }) {
  return (
    <div className="min-h-dvh bg-app app-background flex flex-col items-center justify-center p-5">

      {/* Logo éditorial */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center btn-primary-couture"
          style={{ boxShadow: '0 12px 32px -8px rgba(180,20,10,.55)' }}
        >
          <Scissors size={26} className="text-white" strokeWidth={2} />
        </div>
        <div className="text-center">
          <p className="text-[30px] font-display font-bold text-ink leading-none tracking-tight">
            Gextimo
          </p>
          <p
            className="text-[10px] font-bold tracking-[.22em] uppercase mt-1"
            style={{ color: 'var(--color-gold)' }}
          >
            Maison · Atelier
          </p>
          {subtitle && (
            <p className="text-sm text-ghost mt-2.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Carte */}
      <div className={cn(
        'w-full max-w-sm bg-card rounded-[24px] border border-edge p-6 card-couture',
        'shadow-[0_24px_60px_-24px_rgba(0,0,0,.70)]',
        className,
      )}>
        {children}
      </div>
    </div>
  )
}
