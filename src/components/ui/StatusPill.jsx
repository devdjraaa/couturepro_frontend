import { cn } from '@/utils/cn'

const PILL_CONFIG = {
  en_cours:  { label: 'En cours',  bg: 'bg-primary-50',  text: 'text-primary-700' },
  essai:     { label: 'Essai',     bg: 'bg-accent-50',   text: 'text-accent-600'  },
  livre:     { label: 'Livré',     bg: 'bg-success/10',  text: 'text-success'     },
  annule:    { label: 'Annulé',    bg: 'bg-danger/10',   text: 'text-danger'      },
  brouillon: { label: 'Brouillon', bg: 'bg-subtle',      text: 'text-ghost'       },
  en_retard: { label: 'En retard', bg: 'bg-terra-50',    text: 'text-terra'       },
  attente:   { label: 'En attente',bg: 'bg-warning/10',  text: 'text-warning'     },
}

export default function StatusPill({ kind, label, className }) {
  const cfg = PILL_CONFIG[kind] ?? { label: label ?? kind, bg: 'bg-subtle', text: 'text-ghost' }
  return (
    <span className={cn(
      'inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full',
      cfg.bg, cfg.text, className,
    )}>
      {label ?? cfg.label}
    </span>
  )
}
