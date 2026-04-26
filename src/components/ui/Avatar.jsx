import { cn } from '@/utils/cn'

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

// 7 palettes correspondant aux avatar_index 0–6
export const AVATAR_PALETTES = [
  { bg: 'bg-indigo-100', text: 'text-indigo-700', emoji: '👗' },
  { bg: 'bg-amber-100',  text: 'text-amber-700',  emoji: '✂️' },
  { bg: 'bg-emerald-100',text: 'text-emerald-700',emoji: '🧵' },
  { bg: 'bg-rose-100',   text: 'text-rose-700',   emoji: '👒' },
  { bg: 'bg-sky-100',    text: 'text-sky-700',     emoji: '🪡' },
  { bg: 'bg-violet-100', text: 'text-violet-700',  emoji: '🧶' },
  { bg: 'bg-orange-100', text: 'text-orange-700',  emoji: '👔' },
]

function hashName(name = '') {
  return [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_PALETTES.length
}

function initials(nom = '') {
  const parts = nom.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (nom.slice(0, 2) || '?').toUpperCase()
}

// Accepte nom ou name (compat)
export default function Avatar({ nom, name, photo_url, avatar_index, size = 'md', className }) {
  const label = nom ?? name ?? ''
  const paletteIndex = avatar_index != null ? Number(avatar_index) % AVATAR_PALETTES.length : hashName(label)
  const palette = AVATAR_PALETTES[paletteIndex]

  if (photo_url) {
    return (
      <img
        src={photo_url}
        alt={label}
        className={cn('rounded-full object-cover shrink-0', sizes[size], className)}
      />
    )
  }

  return (
    <div
      aria-label={label}
      className={cn(
        'rounded-full flex items-center justify-center font-display font-semibold shrink-0',
        sizes[size],
        palette.bg,
        palette.text,
        className,
      )}
    >
      {avatar_index != null ? palette.emoji : initials(label)}
    </div>
  )
}
