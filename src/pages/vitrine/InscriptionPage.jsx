import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'

export default function InscriptionPage() {
  const { t } = useTranslation()
  return (
    <VitrineShell>
      <section className="py-20">
        <div className="max-w-[640px] mx-auto px-5 text-center">
          <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary">Gextimo</div>
          <h1 className="font-display font-extrabold text-[clamp(28px,4vw,42px)] mt-2 text-ink">{t('vitrine.inscription.title')}</h1>
          <p className="text-dim mt-2">{t('vitrine.inscription.subtitle')}</p>
          <p className="text-ink mt-5 leading-relaxed">{t('vitrine.inscription.body')}</p>
          <div className="mt-7">
            {/* TODO: pointer vers le lien réel de l'app (Play Store / APK) */}
            <a href="#" className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3.5 rounded-xl bg-primary text-white hover:bg-primary-600 transition">
              📱 {t('vitrine.inscription.cta')}
            </a>
          </div>
          <p className="text-sm text-dim mt-6">
            {t('vitrine.inscription.have_account')}{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">{t('vitrine.inscription.login')}</Link>
          </p>
        </div>
      </section>
    </VitrineShell>
  )
}
