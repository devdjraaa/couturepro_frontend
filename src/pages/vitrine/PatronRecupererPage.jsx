import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import VitrineShell from './VitrineChrome'
import { usePageMeta } from '@/hooks/usePageMeta'

// P163 : menu dédié « Récupérer / Télécharger ma commande » — réservé aux contenus payants.
// On saisit le code de transaction, puis on est renvoyé sur le reçu (statut + téléchargement).
export default function PatronRecupererPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  usePageMeta({ title: t('vitrine.patron.recuperer_title'), path: '/patrons/recuperer' })

  const go = () => {
    const c = code.trim()
    if (c.length < 4) return
    navigate(`/patrons/recu/${encodeURIComponent(c)}`)
  }

  return (
    <VitrineShell>
      <section className="py-16">
        <div className="max-w-[560px] mx-auto px-5">
          <div data-theme="dark" className="rounded-3xl py-12 px-6 text-center bg-inset text-ink">
            <h1 className="font-display text-[clamp(24px,3vw,32px)]">{t('vitrine.patron.recuperer_title')}</h1>
            <p className="text-dim mt-2 mb-6">{t('vitrine.patron.recuperer_subtitle')}</p>

            <div className="flex gap-2 max-w-[480px] mx-auto">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('vitrine.patron.recuperer_placeholder')}
                     onKeyDown={(e) => { if (e.key === 'Enter') go() }}
                     className="flex-1 rounded-xl px-4 py-3 text-[15px] outline-none text-ink bg-subtle border border-edge placeholder:text-ghost font-mono" />
              <button onClick={go}
                      className="inline-flex items-center gap-1.5 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition">
                <Search size={16} />{t('vitrine.patron.recuperer_button')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}
