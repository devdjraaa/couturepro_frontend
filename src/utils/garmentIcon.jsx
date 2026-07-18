// Pt 65 : icône adaptée au TYPE de vêtement, déduite du nom du modèle (il n'existe pas
// de champ « type » en base). lucide n'a que « Shirt » côté habillement → jeu d'icônes
// SVG maison pour les pièces courantes d'un atelier béninois. Repli : Shirt.
// « Mémorisation » (pt 65) : la détection est déterministe, donc tout nouveau modèle dont
// le nom contient un mot-clé connu reçoit automatiquement la bonne icône, sans config.
import { Shirt, Baby, Footprints, Crown } from 'lucide-react'

const S = ({ children, size = 20, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
       stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
       className={className} aria-hidden="true">{children}</svg>
)

// Pantalon
const Pantalon = (p) => <S {...p}><path d="M7 3h10l-1 8-2 10h-3l-1-9-1 9H6L5 11 4 3h3Z" /><path d="M12 3v8" /></S>
// Robe
const Robe = (p) => <S {...p}><path d="M9 3h6l-1 3 3 4-2 2 1 9H6l1-9-2-2 3-4-1-3Z" /></S>
// Jupe
const Jupe = (p) => <S {...p}><path d="M8 4h8l4 8-1 3H5l-1-3 4-8Z" /><path d="M4 12h16" /></S>
// Boubou / grand-boubou / agbada (tenue ample traditionnelle)
const Boubou = (p) => <S {...p}><path d="M6 3h12l3 5-3 2v11H6V10L3 8l3-5Z" /><path d="M12 3v18" /></S>
// Veste / costume
const Veste = (p) => <S {...p}><path d="M8 3l4 3 4-3 3 3-2 3v9h-3l-2-6-2 6H7v-9L5 6l3-3Z" /></S>

// mot-clé (sans accents) → composant icône. Ordre = priorité (le 1er match gagne).
const REGLES = [
  [['boubou', 'agbada', 'grand boubou', 'kaftan', 'gandoura', 'dashiki'], Boubou],
  [['pantalon', 'jean', 'pant', 'short', 'bermuda', 'culotte'], Pantalon],
  [['robe', 'dress', 'gown'], Robe],
  [['jupe', 'skirt', 'pagne'], Jupe],
  [['veste', 'costume', 'blazer', 'manteau', 'suit', 'vareuse', 'gilet'], Veste],
  [['chemise', 'shirt', 't-shirt', 'tshirt', 'tee', 'polo', 'chemisier', 'haut', 'top', 'tunique', 'blouse', 'maillot'], Shirt],
  [['enfant', 'bebe', 'bebe', 'kids', 'child', 'ecolier'], Baby],
  [['chaussure', 'soulier', 'shoe', 'sandale', 'basket'], Footprints],
  [['chapeau', 'coiffe', 'bonnet', 'couronne', 'hat'], Crown],
]

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

/** Retourne le composant icône adapté au nom du vêtement (Shirt par défaut). */
export function garmentIconFor(nom) {
  const t = norm(nom)
  for (const [mots, Icone] of REGLES) {
    if (mots.some((m) => t.includes(m))) return Icone
  }
  return Shirt
}

/** Composant prêt à l'emploi : <GarmentIcon nom="Robe wax" size={20} className="…" /> */
export default function GarmentIcon({ nom, size = 20, className }) {
  const Icone = garmentIconFor(nom)
  return <Icone size={size} className={className} />
}
