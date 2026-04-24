import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { STATUT_COLORS } from '@/constants/enums'

export default function StatusBadge({ statut, className }) {
  const { t } = useTranslation()
  const colors = STATUT_COLORS[statut] ?? STATUT_COLORS.en_cours

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-sm border',
        colors.bg,
        colors.text,
        colors.border,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', colors.dot)} />
      {t(`commandes.statut.${statut}`, { defaultValue: statut })}
    </span>
  )
}
