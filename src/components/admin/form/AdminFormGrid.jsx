import { cn } from '@/utils/cn'

const colsClass = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
}

// Grille responsive nue (sans titre ni séparateur) pour regrouper 2-3 champs
// courts sur une ligne, ex. durée + prix. Voir AdminFormSection pour une
// section titrée avec séparateur.
export default function AdminFormGrid({ cols = 2, className, children }) {
  return (
    <div className={cn('grid grid-cols-1 gap-3', colsClass[cols], className)}>
      {children}
    </div>
  )
}
