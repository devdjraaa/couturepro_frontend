import { useIsFetching } from '@tanstack/react-query'

/**
 * Mince barre de progression bleue (2px) en haut de l'écran quand au moins
 * une requête React Query est en cours. Discret, ne cache rien.
 *
 * Le statut online/offline et le sync WatermelonDB sont gérés par
 * <NetworkStatusButton /> dans le Header — pas de bannière intrusive ici.
 */
export default function SyncIndicator() {
  const isFetching = useIsFetching()
  if (!isFetching) return null

  return (
    <div className="fixed top-0 inset-x-0 z-[60] h-[2px] overflow-hidden pointer-events-none">
      <div
        className="absolute inset-y-0 w-2/5 bg-primary rounded-full"
        style={{ animation: 'loading-progress 1.2s ease-in-out infinite' }}
      />
    </div>
  )
}
