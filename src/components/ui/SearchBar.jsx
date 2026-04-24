import { useRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function SearchBar({ value, onChange, placeholder = 'Rechercher…', className }) {
  const ref = useRef(null)

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ghost">
        <Search size={16} />
      </div>
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-10 bg-subtle text-ink placeholder:text-ghost',
          'border border-transparent rounded-lg pl-9 pr-8 text-sm font-sans',
          'transition-all duration-150',
          'focus:outline-none focus:bg-card focus:border-edge focus:ring-2 focus:ring-primary/20',
          // masque le bouton natif clear des navigateurs
          '[&::-webkit-search-cancel-button]:hidden',
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(''); ref.current?.focus() }}
          className="absolute inset-y-0 right-2 flex items-center px-1 text-ghost hover:text-ink transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
