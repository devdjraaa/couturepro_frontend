import { useTranslation } from 'react-i18next'

export default function SoonBadge({ className = '' }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-ghost border border-edge rounded-full px-2 py-0.5 ${className}`}>
      {t('vitrine.soon', 'Bientôt')}
    </span>
  )
}
