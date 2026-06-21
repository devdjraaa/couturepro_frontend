import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'

const DONE = 2

export default function SuiviPage() {
  const { t } = useTranslation()
  const [val, setVal] = useState('')
  const [show, setShow] = useState(false)

  const steps = t('vitrine.suivi.steps', { returnObjects: true })
  const list = Array.isArray(steps) ? steps : []

  return (
    <VitrineShell>
      <section className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <div className="rounded-3xl py-12 px-6 text-center bg-[#0D0D0D] text-white">
            <h1 className="font-display text-[clamp(24px,3vw,34px)]">{t('vitrine.suivi.title')}</h1>
            <p className="text-white/70 mt-2 mb-6">{t('vitrine.suivi.subtitle')}</p>

            <div className="flex gap-2 max-w-[480px] mx-auto">
              <input value={val} onChange={(e) => setVal(e.target.value)} placeholder={t('vitrine.suivi.placeholder')}
                     className="flex-1 rounded-xl px-4 py-3 text-[15px] outline-none text-white bg-white/10 border border-white/20 placeholder:text-white/50" />
              <button onClick={() => setShow(val.trim().length > 2)}
                      className="inline-flex items-center font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-600 transition">
                {t('vitrine.suivi.button')}
              </button>
            </div>

            {show && (
              <div className="max-w-[560px] mx-auto mt-5 bg-card text-ink rounded-lg p-5 text-left">
                <strong>Boubou Bazin</strong> — Atelier Jaures · <span className="text-primary font-bold">{t('vitrine.suivi.in_progress')}</span>
                <div className="flex justify-between mt-3.5">
                  {list.map((s, i) => {
                    const ok = i < DONE
                    const cur = i === DONE
                    return (
                      <div key={s} className={`flex-1 text-center text-[10.5px] ${ok || cur ? 'text-ink' : 'text-dim'}`}>
                        <div className="w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center mx-auto mb-1.5 text-[11px]"
                             style={{
                               background: ok ? 'var(--color-primary)' : 'var(--color-bg-card)',
                               borderColor: ok || cur ? 'var(--color-primary)' : 'var(--color-border)',
                               color: ok ? '#fff' : cur ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                             }}>
                          {ok ? '✓' : i + 1}
                        </div>
                        {s}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}
