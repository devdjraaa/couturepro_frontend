// Silhouette SVG pour les créations sans photo. Une forme par catégorie.
const SHAPES = {
  robe: <>
    <path d="M30 8 Q40 13 50 8 L54 10 L58 42 L22 42 L26 10 Z" fillOpacity=".9"/>
    <rect x="21" y="41" width="38" height="3" rx="1" fillOpacity=".9"/>
    <path d="M22 42 L12 90 L68 90 L58 42 Z" fillOpacity=".75"/>
  </>,
  costume: <>
    <path d="M15 6 L8 20 L12 90 L40 90 L40 38 L28 20 Z" fillOpacity=".9"/>
    <path d="M65 6 L72 20 L68 90 L40 90 L40 38 L52 20 Z" fillOpacity=".9"/>
    <path d="M15 6 L28 20 L40 38 L40 54 L20 32 Z" fillOpacity=".35"/>
    <path d="M65 6 L52 20 L40 38 L40 54 L60 32 Z" fillOpacity=".35"/>
    <path d="M38 10 L42 10 L44 30 L40 34 L36 30 Z" fillOpacity=".28"/>
  </>,
  boubou: <>
    <path d="M40 4 L16 14 L6 26 L4 90 L76 90 L74 26 L64 14 Z" fillOpacity=".85"/>
    <path d="M6 26 L0 52 L15 48 Z" fillOpacity=".55"/>
    <path d="M74 26 L80 52 L65 48 Z" fillOpacity=".55"/>
    <ellipse cx="40" cy="11" rx="8" ry="5" fill="none" stroke="white" strokeWidth="2" strokeOpacity=".6"/>
    <rect x="33" y="22" width="14" height="2.5" rx="1" fillOpacity=".32"/>
    <rect x="35" y="28" width="10" height="2" rx="1" fillOpacity=".22"/>
  </>,
  enfant: <>
    <path d="M30 10 Q40 16 50 10 L54 12 L56 62 L24 62 L26 12 Z" fillOpacity=".9"/>
    <ellipse cx="40" cy="13" rx="7" ry="4" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity=".6"/>
    <path d="M24 62 L18 88 L62 88 L56 62 Z" fillOpacity=".7"/>
    <rect x="24" y="70" width="8" height="6" rx="1" fillOpacity=".3"/>
    <rect x="48" y="70" width="8" height="6" rx="1" fillOpacity=".3"/>
  </>,
  default: <>
    <path d="M22 8 L8 22 L16 26 L16 88 L64 88 L64 26 L72 22 L58 8 Q40 18 22 8 Z" fillOpacity=".85"/>
    <path d="M8 22 L4 44 L16 40 Z" fillOpacity=".5"/>
    <path d="M72 22 L76 44 L64 40 Z" fillOpacity=".5"/>
    <path d="M30 8 Q40 18 50 8 L44 20 L40 26 L36 20 Z" fillOpacity=".38"/>
  </>,
}

export default function GarmentVisual({ cat, gradient, className = '' }) {
  const shape = SHAPES[cat] ?? SHAPES.default
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: gradient,
        backgroundImage: `${gradient}, repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 9px)`,
      }}
    >
      <svg viewBox="0 0 80 100" fill="white" className="relative w-[50px] h-[62px]" aria-hidden="true">
        {shape}
      </svg>
    </div>
  )
}
