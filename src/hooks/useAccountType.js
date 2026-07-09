import { useAuth } from '@/contexts'

/**
 * Source unique de vérité pour le type de compte.
 *
 * Deux profils, choisis à l'inscription :
 *  - `artisan`  : couturier / tailleur — gestion d'atelier (commandes, clients,
 *                 mesures, caisse, facturation…). Pas de vitrine publique, un seul atelier.
 *  - `designer` : styliste — tout ce que fait l'artisan + vitrine publique, galerie,
 *                 sponsorisation, multi-ateliers, outils créatifs.
 *
 * Défaut = `artisan` (le plus restreint) pour les comptes sans type défini.
 */
export function useAccountType() {
  const { atelier } = useAuth()
  const type = atelier?.type === 'designer' ? 'designer' : 'artisan'
  return {
    type,
    isDesigner: type === 'designer',
    isArtisan:  type === 'artisan',
  }
}
