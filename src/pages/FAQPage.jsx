import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/components/layout'
import { cn } from '@/utils/cn'

const FAQ_COUNT = 10

function FaqItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-card border border-edge rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-3 px-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-ink leading-snug">{item.q}</span>
        <ChevronDown
          size={16}
          className={cn('shrink-0 mt-0.5 text-dim transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-edge">
          <p className="text-sm text-dim leading-relaxed pt-3">{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const { t } = useTranslation()

  const faq = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(`faq.q${i + 1}`),
    a: t(`faq.a${i + 1}`),
  }))

  return (
    <AppLayout title={t('faq.titre')} showBack>
      <div className="p-4 space-y-2">
        <p className="text-sm text-dim text-center pb-2">{t('faq.sous_titre')}</p>
        {faq.map(item => (
          <FaqItem key={item.q} item={item} />
        ))}
      </div>
    </AppLayout>
  )
}
