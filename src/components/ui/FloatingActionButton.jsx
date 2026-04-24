import { Plus } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function FloatingActionButton({ onClick, icon: Icon = Plus, label = 'Ajouter', className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        // Positionné au-dessus de la barre de navigation bas
        'fixed z-40 right-4',
        'bottom-[calc(var(--bottom-nav-height)+1rem+var(--safe-area-bottom))]',
        'w-14 h-14 rounded-full bg-primary text-inverse',
        'flex items-center justify-center',
        'shadow-lg hover:shadow-xl hover:bg-primary-600',
        'transition-all duration-200 active:scale-90',
        className,
      )}
    >
      <Icon size={24} />
    </button>
  )
}
