import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { moderationAdminService } from '@/services/admin/moderationAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

/**
 * Après chaque action, on rafraîchit la liste ET les compteurs : un contenu
 * masqué change les deux, et un compteur qui ment fait rouvrir la file pour rien.
 */
function useActionModeration(mutationFn, cles) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => cles.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  })
}

/* ── Avis ─────────────────────────────────────────────────────────────── */
export function useAdminAvis(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.moderationContenu, 'avis', params],
    queryFn: () => moderationAdminService.avis(params),
  })
}
export function useAvisCompteurs() {
  return useQuery({
    queryKey: [...ADMIN_KEYS.moderationContenu, 'avis', 'compteurs'],
    queryFn: () => moderationAdminService.avisCompteurs(),
  })
}
export function useMasquerAvis() {
  return useActionModeration(
    ({ id, motif }) => moderationAdminService.masquerAvis(id, motif),
    [ADMIN_KEYS.moderationContenu],
  )
}
export function useRetablirAvis() {
  return useActionModeration((id) => moderationAdminService.retablirAvis(id), [ADMIN_KEYS.moderationContenu])
}
export function useModererPhotosAvis() {
  return useActionModeration(
    ({ id, action }) => moderationAdminService.modererPhotosAvis(id, action),
    [ADMIN_KEYS.moderationContenu],
  )
}

/* ── Annonces ─────────────────────────────────────────────────────────── */
export function useAdminAnnonces(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.moderationContenu, 'annonces', params],
    queryFn: () => moderationAdminService.annonces(params),
  })
}
export function useAnnoncesCompteurs() {
  return useQuery({
    queryKey: [...ADMIN_KEYS.moderationContenu, 'annonces', 'compteurs'],
    queryFn: () => moderationAdminService.annoncesCompteurs(),
  })
}
export function useMasquerAnnonce() {
  return useActionModeration(
    ({ id, motif }) => moderationAdminService.masquerAnnonce(id, motif),
    [ADMIN_KEYS.moderationContenu],
  )
}
export function useRetablirAnnonce() {
  return useActionModeration((id) => moderationAdminService.retablirAnnonce(id), [ADMIN_KEYS.moderationContenu])
}

/* ── Vidéos ───────────────────────────────────────────────────────────── */
export function useAdminVideos(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.moderationContenu, 'videos', params],
    queryFn: () => moderationAdminService.videos(params),
  })
}
export function useVideosCompteurs() {
  return useQuery({
    queryKey: [...ADMIN_KEYS.moderationContenu, 'videos', 'compteurs'],
    queryFn: () => moderationAdminService.videosCompteurs(),
  })
}
export function useApprouverVideo() {
  return useActionModeration((id) => moderationAdminService.approuverVideo(id), [ADMIN_KEYS.moderationContenu])
}
export function useRefuserVideo() {
  return useActionModeration(
    ({ id, motif }) => moderationAdminService.refuserVideo(id, motif),
    [ADMIN_KEYS.moderationContenu],
  )
}
