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

export function useWhatsappCommandePrete() {
  return useMutation({
    mutationFn: (commandeId) => whatsappService.getCommandePrete(commandeId),
    onSuccess: ({ lien }) => {
      window.open(lien, '_blank', 'noopener,noreferrer')
    },
  })
}
