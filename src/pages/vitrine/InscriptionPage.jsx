import { Link } from 'react-router-dom'
import { Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import VitrineShell from './VitrineChrome'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function InscriptionPage() {
  const { t } = useTranslation()
  usePageMeta({ title: t('vitrine.inscription.title'), description: t('vitrine.inscription.subtitle'), path: '/inscription' })
  return (
    <VitrineShell>
      <section className="py-20">
        <div className="max-w-[640px] mx-auto px-5 text-center">
          <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary">{t('vitrine.inscription.eyebrow')}</div>
          <h1 className="font-display font-extrabold text-[clamp(28px,4vw,42px)] mt-2 text-ink">{t('vitrine.inscription.title')}</h1>
          <p className="text-dim mt-2">{t('vitrine.inscription.subtitle')}</p>
          <p className="text-ink mt-5 leading-relaxed">{t('vitrine.inscription.body')}</p>
          <div className="mt-7">
            {/* APK stable, maintenue par release.sh (et protégée du rsync --delete du CI). */}
            <a href="/Gextimo-v1.0.apk" download className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3.5 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition">
              <Download size={17} /> {t('vitrine.inscription.cta')}
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
