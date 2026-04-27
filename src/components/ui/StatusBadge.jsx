import { cn } from '@/utils/cn'
import { STATUT_COLORS } from '@/constants/enums'

const STATUT_LABELS = {
  en_cours:  'En cours',
  livre:     'Livré',
  annule:    'Annulé',
  essai:     'Essai',
  actif:     'Actif',
  expire:    'Expiré',
  en_retard: 'En retard',
}

export default function StatusBadge({ statut, className }) {
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
      {STATUT_LABELS[statut] ?? statut}
    </span>
  )
}
