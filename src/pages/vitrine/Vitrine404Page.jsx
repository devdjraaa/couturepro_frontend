import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function Vitrine404Page() {
  const { t } = useTranslation()
  usePageMeta({ title: '404' })
  return (
    <VitrineShell>
      <section className="py-28 text-center px-5 vt-reveal">
        <div className="font-display font-extrabold text-[96px] leading-none text-primary/20 select-none tabular-nums">404</div>
        <h1 className="font-display font-bold text-2xl text-ink mt-3 mb-3">{t('vitrine.page_404.title')}</h1>
        <p className="text-dim mb-8 max-w-sm mx-auto">{t('vitrine.page_404.subtitle')}</p>
        <Link to="/" className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition">
          {t('vitrine.page_404.cta')}
        </Link>
      </section>
    </VitrineShell>
  )
}
