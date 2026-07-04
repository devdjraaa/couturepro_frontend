import { cn } from '@/utils/cn'

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

// Palettes couleurs — utilisées dans ClientForm pour la sélection d'avatar
// Utilise les tokens sémantiques, pas de couleurs Tailwind brutes
export const AVATAR_PALETTES = [
  { bg: 'bg-primary/10',  text: 'text-primary',    emoji: '✂️' },
  { bg: 'bg-gold-light',  text: 'text-gold-dark',  emoji: '🧵' },
  { bg: 'bg-success/10',  text: 'text-success',    emoji: '👗' },
  { bg: 'bg-danger/10',   text: 'text-danger',     emoji: '👒' },
  { bg: 'bg-accent/10',   text: 'text-accent-600', emoji: '🪡' },
  { bg: 'bg-terra-50',    text: 'text-terra',      emoji: '🧶' },
  { bg: 'bg-info/10',     text: 'text-info',       emoji: '👔' },
]

function hashName(name = '') {
  return [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_PALETTES.length
}

function initials(nom = '') {
  const parts = nom.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (nom.slice(0, 2) || '?').toUpperCase()
}

export default function Avatar({ nom, name, photo_url, src, avatar_index, size = 'md', className }) {
  const label = nom ?? name ?? ''
  const photo  = photo_url ?? src

  if (photo) {
    return (
      <img
        src={photo}
        alt={label}
        className={cn('rounded-[13px] object-cover shrink-0', sizes[size], className)}
      />
    )
  }

  // avatar_index choisi → palette couleurs (ex. dans ClientForm)
  if (avatar_index != null) {
    const paletteIndex = Number(avatar_index) % AVATAR_PALETTES.length
    const palette = AVATAR_PALETTES[paletteIndex]
    return (
      <div
        aria-label={label}
        className={cn(
          'rounded-[13px] flex items-center justify-center font-display font-bold shrink-0',
          sizes[size],
          palette.bg,
          palette.text,
          className,
        )}
      >
        {palette.emoji}
      </div>
    )
  }

  // Défaut — dégradé or Gextimo Couture
  return (
    <div
      aria-label={label}
      className={cn('avatar-couture flex items-center justify-center font-display font-bold shrink-0', sizes[size], className)}
    >
      {initials(label)}
    </div>
  )
}
