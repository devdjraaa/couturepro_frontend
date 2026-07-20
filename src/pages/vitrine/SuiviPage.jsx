import { useState } from 'react'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { getSuivi } from './vitrineApi'
import { usePageMeta } from '@/hooks/usePageMeta'

const STEP_KEYS = ['commande', 'coupe', 'confection', 'essayage', 'livraison']

export default function SuiviPage() {
  const { t } = useTranslation()
  usePageMeta({ title: t('vitrine.suivi.title'), description: t('vitrine.suivi.subtitle'), path: '/suivi' })
  const [val, setVal] = useState('')
  const [result, setResult] = useState(undefined) // undefined = idle, null = introuvable, objet = ok
  const [loading, setLoading] = useState(false)

  const steps = t('vitrine.suivi.steps', { returnObjects: true })
  const list = Array.isArray(steps) ? steps : []

  const search = async () => {
    const ref = val.trim()
    if (ref.length < 3 || loading) return
    setLoading(true)
    try {
      const d = await getSuivi(ref)
      setResult(d && d.reference ? d : null)
    } finally {
      setLoading(false)
    }
  }

  const annule = result && result.statut === 'annule'
  const currentIdx = result
    ? (result.statut === 'livre' ? STEP_KEYS.length : Math.max(0, STEP_KEYS.indexOf(result.etape)))
    : 0

  return (
    <VitrineShell>
      <section className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <div data-theme="dark" className="rounded-3xl py-12 px-6 text-center bg-inset text-ink">
            <h1 className="font-display text-[clamp(24px,3vw,34px)]">{t('vitrine.suivi.title')}</h1>
            <p className="text-dim mt-2 mb-6">{t('vitrine.suivi.subtitle')}</p>

            <div className="flex gap-2 max-w-[480px] mx-auto">
              <input value={val} onChange={(e) => setVal(e.target.value)} placeholder={t('vitrine.suivi.placeholder')}
                     onKeyDown={(e) => { if (e.key === 'Enter') search() }}
                     className="flex-1 rounded-xl px-4 py-3 text-[15px] outline-none text-ink bg-subtle border border-edge placeholder:text-ghost" />
              <button onClick={search} disabled={loading}
                      className="inline-flex items-center font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition disabled:opacity-60">
                {t('vitrine.suivi.button')}
              </button>
            </div>

            {result === null && <p className="text-dim mt-5">{t('vitrine.suivi.not_found')}</p>}

            {result && (
              <div className="max-w-[560px] mx-auto mt-5 bg-card text-ink rounded-lg p-5 text-left">
                <strong>{result.modele || '—'}</strong>{result.atelier ? `, ${result.atelier}` : ''} ·{' '}
                <span className={annule ? 'text-danger font-bold' : 'text-primary font-bold'}>
                  {annule ? t('vitrine.suivi.cancelled') : t('vitrine.suivi.in_progress')}
                </span>
                <div className="text-xs text-ghost mt-1.5 tabular-nums">
                  {t('vitrine.suivi.ref_label')} {result.reference}
                  {result.date_livraison_prevue && (
                    <> · {t('vitrine.suivi.delivery')} : {new Date(result.date_livraison_prevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                  )}
                </div>
                {!annule && (
                  <ol aria-label={t('vitrine.suivi.progress_label')} className="flex justify-between mt-3.5 list-none p-0 m-0">
                    {list.map((s, i) => {
                      const ok = i < currentIdx
                      const cur = i === currentIdx
                      return (
                        <li key={s} aria-current={cur ? 'step' : undefined} className={`flex-1 text-center text-[10.5px] ${ok || cur ? 'text-ink' : 'text-dim'}`}>
                          <div className="w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center mx-auto mb-1.5 text-[11px]"
                               style={{
                                 background: ok ? 'var(--color-primary)' : 'var(--color-bg-card)',
                                 borderColor: ok || cur ? 'var(--color-primary)' : 'var(--color-border)',
                                 color: ok ? 'var(--color-text-inverse)' : cur ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                               }}>
                            {ok ? <Check size={13} strokeWidth={3} aria-hidden="true" /> : i + 1}
                          </div>
                          {s}
                        </li>
                      )
                    })}
                  </ol>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}
