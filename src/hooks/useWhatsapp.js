import { useMutation } from '@tanstack/react-query'
import { whatsappService } from '@/services/whatsappService'

export function useWhatsappRappel() {
  return useMutation({
    mutationFn: (clientId) => whatsappService.getRappelClient(clientId),
    onSuccess: ({ lien }) => {
      window.open(lien, '_blank', 'noopener,noreferrer')
    },
  })
}
