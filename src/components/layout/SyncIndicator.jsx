import { useIsFetching } from '@tanstack/react-query'

export default function SyncIndicator() {
  const isFetching = useIsFetching()
  if (!isFetching) return null

  return (
    <div className="fixed top-0 inset-x-0 z-[60] h-[2px] overflow-hidden">
      <div
        className="absolute inset-y-0 w-2/5 bg-primary rounded-full"
        style={{ animation: 'loading-progress 1.2s ease-in-out infinite' }}
      />
    </div>
  )
}
