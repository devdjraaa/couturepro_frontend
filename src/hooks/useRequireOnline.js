import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useNetwork } from '@/hooks/useNetwork'

/**
 * App mobile full-offline : seules quelques actions exigent internet
 * (connexion/déconnexion, upgrade d'abonnement + paiement, normalisation DGI…).
 *
 * Retourne un garde `requireOnline(action?)` :
 *  - en ligne  → exécute `action` (si fournie) et renvoie true
 *  - hors-ligne → affiche un petit message « connexion internet requise » et renvoie false
 *
 * Usage :
 *   const requireOnline = useRequireOnline()
 *   const payer = () => requireOnline(() => initierPaiement.mutate(...))
 *   // ou :  if (!requireOnline()) return
 */
export function useRequireOnline() {
  const { isOnline } = useNetwork()
  const { t } = useTranslation()

  return (action) => {
    if (!isOnline) {
      toast.error(t('reseau.connexion_requise'))
      return false
    }
    action?.()
    return true
  }
}
