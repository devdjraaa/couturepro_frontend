import { cn } from '@/utils/cn'

// Jetons SÉMANTIQUES et non palette Tailwind brute : `emerald-50` n'existe
// qu'en clair, si bien qu'en thème sombre ces pastilles restaient des taches
// claires sur fond noir. `--color-success` & co. sont redéfinis par thème
// (src/index.css), donc ces variantes suivent le mode d'affichage.
const variants = {
  default: 'bg-subtle text-dim border-edge',
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger:  'bg-danger/10 text-danger border-danger/20',
  terra:   'bg-terra/10 text-terra border-terra/20',
}

const sizes = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
}

export default function Badge({ children, variant = 'default', size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-sm border',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
