import { Link } from 'react-router-dom'
import { Smartphone, ArrowRight, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts'
import { ROUTES } from '@/constants/routes'
import { VitrineLogo } from '@/pages/vitrine/VitrineChrome'

export default function ArtisanAppPage() {
  const { t } = useTranslation()
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
        {t('artisan_app.titre')}
      </h1>
      <p className="text-dim max-w-sm mb-2">
        {atelier?.nom && <>{t('commun.bonjour')} <strong className="text-ink">{atelier.nom}</strong>. </>}{t('artisan_app.intro')}
      </p>
      <p className="text-sm text-ghost max-w-sm mb-8">
        {t('artisan_app.sous_texte')}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href="https://play.google.com/store/apps/details?id=com.gextimo.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-600 transition"
        >
          <Smartphone size={17} />
          {t('artisan_app.telecharger')}
        </a>

        <Link
          to={ROUTES.DASHBOARD}
          className="inline-flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-xl border border-edge text-ink hover:border-primary hover:text-primary transition"
        >
          {t('artisan_app.continuer')}
          <ArrowRight size={16} />
        </Link>

        <button
          onClick={logout}
          className="inline-flex items-center justify-center gap-2 text-sm text-ghost hover:text-danger transition mt-1"
        >
          <LogOut size={14} />
          {t('auth.deconnexion')}
        </button>
      </div>
    </div>
  )
}
