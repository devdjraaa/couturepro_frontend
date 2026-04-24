import { cn } from '@/utils/cn'

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

const PALETTE = [
  'bg-indigo-100 text-indigo-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
]

function hashName(name = '') {
  return [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % PALETTE.length
}

function initials(nom = '') {
  const parts = nom.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return nom.slice(0, 2).toUpperCase()
}

export default function Avatar({ nom = '', photo_url, size = 'md', className }) {
  if (photo_url) {
    return (
      <img
        src={photo_url}
        alt={nom}
        className={cn('rounded-full object-cover shrink-0', sizes[size], className)}
      />
    )
  }

  return (
    <div
      aria-label={nom}
      className={cn(
        'rounded-full flex items-center justify-center font-display font-semibold shrink-0',
        sizes[size],
        PALETTE[hashName(nom)],
        className,
      )}
    >
      {initials(nom)}
    </div>
  )
}
