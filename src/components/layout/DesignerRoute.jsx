import { Navigate, Outlet } from 'react-router-dom'
import { useAccountType } from '@/hooks/useAccountType'
import { ROUTES } from '@/constants/routes'

/**
 * Garde de routes réservées aux comptes « designer » (vitrine-storefront,
 * outils créatifs). Un artisan qui tente d'y accéder par URL directe est
 * renvoyé au tableau de bord. La galerie de photos, elle, reste accessible
 * aux deux types (banque d'images alimentée depuis le mobile).
 */
export default function DesignerRoute() {
  const { isDesigner } = useAccountType()
  if (!isDesigner) return <Navigate to={ROUTES.DASHBOARD} replace />
  return <Outlet />
}
