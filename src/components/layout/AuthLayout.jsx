import { useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

export default function AuthLayout({ children, subtitle, className }) {
  const location = useLocation()

  return (
    <div className="min-h-dvh bg-app app-background flex flex-col items-center justify-center p-5">

      {/* Logo éditorial */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 8px 32px -8px rgba(0,0,0,.50)',
          }}
        >
          <img src="/favicon.svg" alt="Gextimo" className="w-10 h-10" />
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

      {/* Carte — re-monte à chaque changement de route → animation d'entrée */}
      <div
        key={location.pathname}
        className={cn(
          'w-full max-w-sm bg-card rounded-[24px] border border-edge p-6 card-couture',
          'shadow-[0_24px_60px_-24px_rgba(0,0,0,.70)]',
          'animate-auth-card-enter',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
