import { useEffect, useState } from 'react'
import { Scissors, Spool, Shirt, Crown, Ruler, Palette, UserRound } from 'lucide-react'
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
/**
 * Palettes d'avatar. Les pictogrammes étaient des EMOJI : leur dessin change
 * d'un téléphone à l'autre (Android, iOS, navigateur), et la charte proscrit
 * l'emoji dans l'interface. Ce sont désormais des icônes de la bibliothèque,
 * qui suivent la couleur du texte et restent identiques partout.
 */
export const AVATAR_PALETTES = [
  { bg: 'bg-primary/10',  text: 'text-primary',    Icone: Scissors },
  { bg: 'bg-gold-light',  text: 'text-gold-dark',  Icone: Spool    },
  { bg: 'bg-success/10',  text: 'text-success',    Icone: Shirt    },
  { bg: 'bg-danger/10',   text: 'text-danger',     Icone: Crown    },
  { bg: 'bg-accent/10',   text: 'text-accent-600', Icone: Ruler    },
  { bg: 'bg-terra-50',    text: 'text-terra',      Icone: Palette  },
  { bg: 'bg-info/10',     text: 'text-info',       Icone: UserRound},
]

/** Taille du pictogramme selon la taille de l'avatar. */
const TAILLES_ICONE = { xs: 12, sm: 15, md: 18, lg: 22, xl: 28 }

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

  // Pt 91 — une photo dont le fichier a disparu affichait l'icône d'image
  // cassée du navigateur, en plein milieu d'une liste de clients. On repasse
  // alors sur les initiales, exactement comme si aucune photo n'était fournie :
  // l'absence d'image est un état normal, pas une erreur à montrer.
  const [photoCassee, setPhotoCassee] = useState(false)

  useEffect(() => { setPhotoCassee(false) }, [photo])

  if (photo && !photoCassee) {
    return (
      <img
        src={photo}
        alt={label}
        onError={() => setPhotoCassee(true)}
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
        <palette.Icone size={TAILLES_ICONE[size] ?? 18} />
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
