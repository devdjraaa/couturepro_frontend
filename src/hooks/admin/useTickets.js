import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsAdminService } from '@/services/admin/ticketsAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useAdminTickets(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.tickets, params],
    queryFn: () => ticketsAdminService.getAll(params),
  })
}

export function useAdminTicket(id) {
  return useQuery({
    queryKey: ADMIN_KEYS.ticket(id),
    queryFn: () => ticketsAdminService.getById(id),
    enabled: !!id,
  })
}

export function useAssignerTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, assigned_to }) => ticketsAdminService.assigner(id, assigned_to),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: ADMIN_KEYS.ticket(id) }),
  })
}

export function useRepondreTicket(ticketId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => ticketsAdminService.repondre(ticketId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.ticket(ticketId) })
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.tickets })
    },
  })
}

export function useFermerTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => ticketsAdminService.fermer(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.ticket(id) })
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.tickets })
    },
  })
}

export function useRouvrirTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => ticketsAdminService.rouvrir(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.ticket(id) })
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.tickets })
    },
  })
}
