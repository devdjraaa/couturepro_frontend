import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketService } from '@/services/ticketService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

export function useTickets() {
  return useQuery({
    queryKey: QUERY_KEYS.tickets,
    queryFn: () => ticketService.getAll(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useTicket(id) {
  return useQuery({
    queryKey: [...QUERY_KEYS.tickets, id],
    queryFn: () => ticketService.getById(id),
    enabled: !!id,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCreerTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => ticketService.creer(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets }),
  })
}

export function useRepondreTicket(ticketId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => ticketService.repondre(ticketId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.tickets, ticketId] }),
  })
}
