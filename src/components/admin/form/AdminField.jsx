import { cn } from '@/utils/cn'

// Trois habillages, un seul look. Les pages admin en avaient dérivé quatre
// variantes de `INPUT` et trois de `LABEL` à force de recopie ; ce sont les
// seules différences qui correspondaient à un vrai besoin.

// Base visuelle, sans largeur : l'appelant la fixe (`flex-1`, `sm:w-20`…).
export const ADMIN_CONTROL = 'border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-subtle disabled:text-ghost'

// Champ de formulaire : pleine largeur. Le cas courant.
export const ADMIN_INPUT = `w-full ${ADMIN_CONTROL}`

// Contrôle de barre d'outils (filtre, tri) : compact, largeur libre.
export const ADMIN_FILTER = 'border border-edge rounded-xl px-3 py-1.5 text-xs text-ink bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'

export const ADMIN_LABEL = 'text-xs text-ghost block mb-1'

export default function AdminField({ label, rows, mono, className, ...props }) {
  const Tag = rows ? 'textarea' : 'input'

  return (
    <div>
      {label && <label className={ADMIN_LABEL}>{label}</label>}
      <Tag rows={rows} className={cn(ADMIN_INPUT, mono && 'font-mono', className)} {...props} />
    </div>
  )
}
