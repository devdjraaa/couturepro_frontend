import { useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

// Écran d'authentification — engagé en thème clair (le logo Gextimo est sombre/transparent,
// il doit rester lisible quel que soit le thème de l'app). Mobile : fin bandeau rouge (status bar)
// + logo grand centré + formulaire. Bureau : panneau de marque rouge à gauche, formulaire à droite.
const TRAME = { backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,.5) 0 1px, transparent 1px 11px)' }

export default function AuthLayout({ children, subtitle, className }) {
  const location = useLocation()

  return (
    <div data-theme="light" className="min-h-dvh bg-card flex flex-col lg:flex-row">

      {/* Marque (bureau) / bandeau rouge de la status bar (mobile) */}
      <div className="header-gradient text-inverse relative overflow-hidden pt-safe shrink-0 lg:w-[46%] lg:pt-0 lg:p-12">
        <div className="absolute inset-0 opacity-[.12] pointer-events-none" style={TRAME} />
        <div className="relative hidden lg:flex lg:flex-col lg:justify-between lg:h-full text-center">
          <div aria-hidden />
          <div>
            <div className="mx-auto w-fit rounded-[22px] bg-white px-8 py-6 shadow-xl">
              <img src="/logoforlogin.png" alt="Gextimo" className="w-64 max-w-[70vw] select-none" draggable="false" />
            </div>
            <h2 className="font-display text-[27px] leading-tight font-semibold mt-7 text-balance">
              La solution complète des professionnels de la mode
            </h2>
            <p className="text-inverse/85 mt-3 max-w-sm mx-auto">
              Gérez vos clients, commandes, mesures et paiements en toute simplicité.
            </p>
          </div>
          <p className="text-inverse/60 text-xs">© Gextimo · NovAfriq</p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex flex-col lg:justify-center bg-card px-5 pb-8 lg:px-16">
        {/* Logo — mobile (grand, centré) */}
        <div className="lg:hidden pt-8 pb-1 text-center">
          <img
            src="/logoforlogin.png"
            alt="Gextimo — Créez · Gérez · Rayonnez"
            className="w-60 max-w-[72%] mx-auto select-none pointer-events-none"
            draggable="false"
          />
        </div>

        <div
          key={location.pathname}
          className={cn('w-full max-w-sm mx-auto lg:mx-0 animate-auth-card-enter', className)}
        >
          {subtitle && (
            <p className="text-center lg:text-left text-[15px] font-medium text-ink mt-1 mb-5">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
