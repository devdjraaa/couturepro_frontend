import { Link } from 'react-router-dom'
import { Smartphone, Globe, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ROUTES } from '@/constants/routes'

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
          {/* P187 — l'inscription se fait DEPUIS LE NAVIGATEUR. La page
              envoyait télécharger une application, alors que la route /register
              existe : on faisait faire un détour de plusieurs minutes, et
              perdait sans doute des créateurs au passage.
              L'application reste proposée, mais pour ce qu'elle apporte en plus
              — la mobilité et les notifications — pas comme un péage. */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={ROUTES.REGISTER}
                  className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3.5 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition">
              <Globe size={16} aria-hidden="true" /> {t('vitrine.inscription.cta_web')}
            </Link>
            {/* APK stable, maintenue par release.sh et protégée du rsync
                --delete du CI — c'est le chemin que la branche android emploie,
                les deux doivent pointer au même endroit. */}
            <a href="/Gextimo-v1.0.apk" download
               className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3.5 rounded-xl border border-edge text-ink hover:border-primary hover:text-primary transition">
              <Smartphone size={16} aria-hidden="true" /> {t('vitrine.inscription.cta')}
            </a>
          </div>
          <p className="text-sm text-dim mt-6">
            {t('vitrine.inscription.have_account')}{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">{t('vitrine.inscription.login')}</Link>
          </p>
        </div>
      </section>

      {/* P138 — Aperçu tarifs sous le formulaire d'inscription */}
      <section className="py-12 border-t border-edge bg-subtle">
        <div className="max-w-[640px] mx-auto px-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap size={16} className="text-primary" />
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-primary">
              {t('vitrine.inscription.tarifs_label')}
            </p>
          </div>
          <p className="text-dim text-sm mt-1">{t('vitrine.inscription.tarifs_desc')}</p>
          <Link to="/premium"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/5 transition">
            {t('vitrine.inscription.tarifs_cta')}
          </Link>
        </div>
      </section>
    </VitrineShell>
  )
}
