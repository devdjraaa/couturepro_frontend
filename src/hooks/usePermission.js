import { useAuth } from '@/contexts'

export function usePermission(permission) {
  const { can } = useAuth()
  return can(permission)
}
