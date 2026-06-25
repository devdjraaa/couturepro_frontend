import { Link } from 'react-router-dom'
import { Smartphone, ArrowRight, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts'
import { ROUTES } from '@/constants/routes'
import { VitrineLogo } from '@/pages/vitrine/VitrineChrome'

export default function ArtisanAppPage() {
  const { logout, atelier } = useAuth()

  return (
    <div className="min-h-dvh bg-app flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8">
        <VitrineLogo />
      </div>

      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <Smartphone size={28} className="text-primary" />
      </div>

      <h1 className="font-display font-bold text-2xl text-ink mb-2">
        Votre espace est sur l'application mobile
      </h1>
      <p className="text-dim max-w-sm mb-2">
        Bonjour {atelier?.nom && <strong className="text-ink">{atelier.nom}</strong>}. L'espace Artisan Gextimo — gestion des clients, commandes, mesures et bien plus — est optimisé pour l'application mobile.
      </p>
      <p className="text-sm text-ghost max-w-sm mb-8">
        Téléchargez l'application ou continuez sur le navigateur.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href="https://play.google.com/store/apps/details?id=com.gextimo.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-600 transition"
        >
          <Smartphone size={17} />
          Télécharger sur Android
        </a>

        <Link
          to={ROUTES.DASHBOARD}
          className="inline-flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-xl border border-edge text-ink hover:border-primary hover:text-primary transition"
        >
          Continuer sur le navigateur
          <ArrowRight size={16} />
        </Link>

        <button
          onClick={logout}
          className="inline-flex items-center justify-center gap-2 text-sm text-ghost hover:text-danger transition mt-1"
        >
          <LogOut size={14} />
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
