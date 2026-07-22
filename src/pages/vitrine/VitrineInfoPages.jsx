import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Store, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react'
import VitrineShell from './VitrineChrome'
import { usePageMeta } from '@/hooks/usePageMeta'

function PageHead({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-[720px] mx-auto text-center mb-8">
      <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary">{eyebrow}</div>
      <h1 className="font-display font-extrabold text-[clamp(28px,4vw,42px)] mt-2 text-ink">{title}</h1>
      {subtitle && <p className="text-dim mt-2">{subtitle}</p>}
    </div>
  )
}

export function QuiSommesNousPage() {
  const { t } = useTranslation()
  usePageMeta({ title: t('vitrine.about.title'), path: '/qui-sommes-nous' })
  const values = t('vitrine.about.values', { returnObjects: true })
  return (
    <VitrineShell>
      <section className="py-16">
        <div className="max-w-[760px] mx-auto px-5">
          <PageHead eyebrow={t('vitrine.about.eyebrow')} title={t('vitrine.about.title')} />
          <p className="text-ink leading-relaxed mb-4">{t('vitrine.about.p1')}</p>
          <p className="text-dim leading-relaxed mb-8">{t('vitrine.about.p2')}</p>

          {/* P193 : phrase de marque courte, en clôture du récit de mission. */}
          <p className="font-display text-lg text-primary font-semibold mb-10">{t('vitrine.about.baseline')}</p>

          <h2 className="font-display text-xl text-ink mb-4">{t('vitrine.about.values_title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {(Array.isArray(values) ? values : []).map((v) => (
              <div key={v} className="bg-card border border-edge rounded-lg p-5 text-sm font-medium text-ink">{v}</div>
            ))}
          </div>

          <div data-theme="dark" className="rounded-2xl p-6 text-center bg-inset text-ink font-display font-bold">
            {t('vitrine.about.novafrique')}
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}

/**
 * P183-184 — page « en cartes » vers laquelle pointe le dropdown Documentation
 * du header : chaque carte renvoie au contenu complet correspondant, comme
 * demandé. Reprend exactement les 3 rubriques et leur texte.
 */
export function DocumentationPage() {
  const { t } = useTranslation()
  usePageMeta({ title: t('vitrine.documentation.title'), path: '/documentation' })

  const cartes = [
    { icone: Store,       cle: 'creer_vitrine',       to: '/inscription' },
    { icone: CreditCard,  cle: 'tarifs_commissions',  to: '/premium' },
    { icone: ShieldCheck, cle: 'donnees_securite',    to: '/confidentialite' },
  ]

  return (
    <VitrineShell>
      <section className="py-16">
        <div className="max-w-[900px] mx-auto px-5">
          <PageHead eyebrow={t('vitrine.documentation.eyebrow')} title={t('vitrine.documentation.title')} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cartes.map(({ icone: Icone, cle, to }) => (
              <Link key={cle} to={to}
                className="group bg-card border border-edge rounded-2xl p-5 hover:border-primary transition flex flex-col">
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icone size={18} aria-hidden="true" />
                </span>
                <p className="font-display font-bold text-ink mb-1.5">{t(`vitrine.dropdown.docs.${cle}.label`)}</p>
                <p className="text-[13px] text-dim leading-relaxed flex-1">{t(`vitrine.dropdown.docs.${cle}.desc`)}</p>
                <span className="text-primary text-[13px] font-semibold inline-flex items-center gap-1 mt-4 group-hover:gap-2 transition-all">
                  {t('commun.en_savoir_plus')}<ArrowRight size={13} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}

export function AidePage() {
  const { t } = useTranslation()
  usePageMeta({ title: t('vitrine.aide.title'), description: t('vitrine.aide.subtitle'), path: '/aide' })
  const faq = t('vitrine.aide.faq', { returnObjects: true })
  return (
    <VitrineShell>
      <section className="py-16">
        <div className="max-w-[760px] mx-auto px-5">
          <PageHead eyebrow={t('vitrine.aide.eyebrow')} title={t('vitrine.aide.title')} subtitle={t('vitrine.aide.subtitle')} />
          <div className="space-y-3">
            {(Array.isArray(faq) ? faq : []).map((f) => (
              <details key={f.q} className="group bg-card border border-edge rounded-lg p-4">
                <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-ink text-[15px]">
                  {f.q}
                  <span className="text-primary transition group-open:rotate-45">＋</span>
                </summary>
                <p className="text-dim text-sm mt-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-8 rounded-2xl p-6 text-center bg-elevated border border-edge">
            <h3 className="font-display text-lg text-ink">{t('vitrine.aide.contact_title')}</h3>
            <p className="text-dim text-sm mt-1">{t('vitrine.aide.contact')}</p>
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}

export function ArtisansPage() {
  const { t } = useTranslation()
  usePageMeta({ title: t('vitrine.artisans.title'), path: '/artisans' })
  return (
    <VitrineShell>
      <section className="py-16">
        <div className="max-w-[760px] mx-auto px-5">
          <PageHead eyebrow={t('vitrine.artisans.eyebrow')} title={t('vitrine.artisans.title')} />
          <p className="text-ink leading-relaxed mb-4">{t('vitrine.artisans.p1')}</p>
          <p className="text-dim leading-relaxed mb-8">{t('vitrine.artisans.p2')}</p>
          <div className="text-center">
            <Link to="/#gallery" className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition">
              {t('vitrine.artisans.cta')}
            </Link>
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}
