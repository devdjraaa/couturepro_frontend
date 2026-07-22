import { cn } from '@/utils/cn'
import AdminFormGrid from './AdminFormGrid'

// Reprend SECTION/SECT_HEAD dupliqués dans les pages admin : titre + séparateur.
// Passer `cols` (2 ou 3) pour ranger les champs enfants en grille responsive ;
// l'omettre pour un contenu à longueur variable (ex. liste de champs dynamiques).
//
// `premiereColonne` : section en tête d'une 2e colonne. Le séparateur reste
// utile en dessous de lg (les colonnes s'empilent, il sépare vraiment), mais
// devient parasite à partir de lg où la section démarre le haut de sa colonne.
export default function AdminFormSection({ title, cols, premiereColonne, children }) {
  return (
    <div className={cn('border-t border-edge pt-3', premiereColonne && 'lg:border-t-0 lg:pt-0')}>
      {title && <p className="text-2xs font-semibold text-ghost uppercase tracking-widest mb-3">{title}</p>}
      {cols ? <AdminFormGrid cols={cols}>{children}</AdminFormGrid> : children}
    </div>
  )
}
