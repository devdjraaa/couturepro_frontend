import { useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { VitrineLogo } from '@/pages/vitrine/VitrineChrome'

export default function AuthLayout({ children, subtitle, className }) {
  const location = useLocation()

  return (
    <div className="min-h-dvh bg-app app-background flex flex-col items-center justify-center p-5">

      {/* Logo */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <VitrineLogo />
        <p
          className="text-[10px] font-bold tracking-[.22em] uppercase"
          style={{ color: 'var(--color-gold)' }}
        >
          Maison · Atelier
        </p>
        {subtitle && (
          <p className="text-sm text-ghost mt-1">{subtitle}</p>
        )}
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
