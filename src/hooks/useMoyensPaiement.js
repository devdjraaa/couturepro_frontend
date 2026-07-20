import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { isMock } from '@/services/mockFlag'

/**
 * S08C-30 — Moyens de paiement de la FACTURATION (devis / factures / reçus).
 *
 * La liste était figée dans `FacturationPage` (`wave`, `om`, `especes`,
 * `virement`, `autre`) : proposer un moyen de plus imposait un redéploiement, et
 * `wave` / `om` y figuraient alors qu'aucune intégration ne les gérait. Elle vient
 * désormais de `GET /moyens-paiement`, éditable en admin.
 *
 * À NE PAS confondre avec les modes d'encaissement de la caisse
 * (`especes` / `mobile_money` / `virement`) : ceux-là enregistrent comment le
 * client a réellement payé sur place, ils n'ont pas à passer par cette liste.
 */
export function useMoyensPaiement() {
  const query = useQuery({
    queryKey: ['moyens-paiement'],
    queryFn: async () => {
      const { data } = await api.get('/moyens-paiement')
      return data
    },
    // Une liste de configuration : inutile de la rafraîchir en permanence.
    staleTime: 30 * 60 * 1000,
    enabled: !isMock(),
  })

  // Repli sur le moyen par défaut du serveur tant que la requête n'a pas répondu
  // (ou en mode démo) : le formulaire reste utilisable, jamais un <select> vide.
  const moyens = query.data?.moyens ?? [{ cle: 'fedapay', label: 'FedaPay', defaut: true }]

  return {
    ...query,
    moyens,
    defaut: query.data?.defaut ?? moyens[0]?.cle ?? null,
  }
}
