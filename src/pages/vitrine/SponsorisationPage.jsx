import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Zap, Crown, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { getSponsorisation } from './vitrineApi'
import { usePageMeta } from '@/hooks/usePageMeta'

const PACKAGE_ICONS = [Star, Zap, Crown]

export default function SponsorisationPage() {
  const { t } = useTranslation()
  usePageMeta({ title: t('vitrine.sponsor.title'), description: t('vitrine.sponsor.subtitle'), path: '/mise-en-avant' })

  const [data, setData] = useState(null)
  useEffect(() => {
    getSponsorisation()
      .then(setData)
      .catch(() => setData({ actif: false, offres: [] }))
  }, [])

  const features = t('vitrine.sponsor.features', { returnObjects: true })
  const steps    = t('vitrine.sponsor.how_steps',  { returnObjects: true })

  return (
    <VitrineShell>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="py-16 text-center px-5 vt-reveal">
        <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary mb-3">
          {t('vitrine.sponsor.eyebrow')}
        </div>
        <h1 className="font-display font-extrabold text-[clamp(28px,4vw,44px)] text-ink">
          {t('vitrine.sponsor.title')}
        </h1>
        <p className="text-dim mt-2 max-w-lg mx-auto">{t('vitrine.sponsor.subtitle')}</p>

        <div className="mt-8 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-semibold px-4 py-2 rounded-full">
          <Star size={13} className="fill-primary" />
          {t('vitrine.sponsor.badge')}
        </div>
      </section>

      {/* ── Offres ──────────────────────────────────────────────────── */}
      <section className="max-w-[960px] mx-auto px-5 pb-16">
        {data === null ? (
          <p className="text-center text-dim py-10">{t('vitrine.sponsor.loading')}</p>
        ) : !data.actif || !data.offres?.length ? (
          <div className="bg-card border border-edge rounded-xl p-10 text-center">
            <p className="text-dim">{t('vitrine.sponsor.inactive')}</p>
          </div>
        ) : (
          <div className="vt-stagger grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.offres.map((o, i) => {
              const Icon    = PACKAGE_ICONS[i] ?? Star
              const isBest  = i === data.offres.length - 1
              const parJour = Math.round(o.prix / o.jours)

              return (
                <div
                  key={o.jours}
                  className={[
                    'vt-card relative bg-card border rounded-2xl p-7 flex flex-col',
                    isBest
                      ? 'border-primary shadow-lg shadow-primary/10 md:scale-[1.02]'
                      : 'border-edge',
                  ].join(' ')}
                >
                  {isBest && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full bg-primary text-inverse whitespace-nowrap">
                      {t('vitrine.sponsor.best_value')}
                    </span>
                  )}

                  <div className={[
                    'w-10 h-10 rounded-xl flex items-center justify-center mb-4',
                    isBest ? 'bg-primary/10' : 'bg-subtle',
                  ].join(' ')}>
                    <Icon size={20} className={isBest ? 'text-primary' : 'text-dim'} />
                  </div>

                  <h3 className="font-display font-bold text-xl text-ink">
                    {t('vitrine.sponsor.package_days', { n: o.jours })}
                  </h3>

                  <div className="mt-3 mb-1">
                    <span className="font-display font-extrabold text-3xl text-ink tabular-nums">
                      {o.prix.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-dim text-sm ml-1">{t('vitrine.sponsor.fcfa')}</span>
                  </div>
                  <p className="text-xs text-success font-medium mb-5">
                    ≈ {parJour.toLocaleString('fr-FR')} {t('vitrine.sponsor.per_day')}
                  </p>

                  <ul className="space-y-2.5 flex-1">
                    {(Array.isArray(features) ? features : []).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-dim">
                        <Check size={14} className="text-primary shrink-0 mt-1" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/aide"
                    className={[
                      'vt-btn-primary mt-6 w-full py-3 rounded-xl font-semibold text-sm text-center transition',
                      isBest
                        ? 'bg-primary text-inverse hover:bg-primary-600'
                        : 'border border-edge text-ink hover:border-primary hover:text-primary',
                    ].join(' ')}
                  >
                    {t('vitrine.sponsor.package_cta')}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Comment ça marche ───────────────────────────────────────── */}
      <section className="bg-elevated py-14 px-5">
        <div className="max-w-[760px] mx-auto text-center">
          <h2 className="font-display font-bold text-2xl text-ink mb-8">
            {t('vitrine.sponsor.how_title')}
          </h2>
          <div className="vt-stagger grid grid-cols-1 sm:grid-cols-3 gap-5">
            {(Array.isArray(steps) ? steps : []).map((s, i) => (
              <div key={i} className="vt-item bg-card border border-edge rounded-xl p-6 text-left">
                <div className="font-display font-extrabold text-3xl text-primary mb-3 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-semibold text-ink mb-1">{s.t}</h3>
                <p className="text-sm text-dim leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────── */}
      <section data-theme="dark" className="bg-inset py-14 px-5 text-center">
        <h2 className="font-display font-bold text-2xl text-ink mb-2">
          {t('vitrine.sponsor.contact_title')}
        </h2>
        <p className="text-dim text-sm max-w-md mx-auto mb-6">
          {t('vitrine.sponsor.contact_sub')}
        </p>
        <Link
          to="/aide"
          className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition"
        >
          {t('vitrine.sponsor.contact_cta')}
        </Link>
      </section>
    </VitrineShell>
  )
}
