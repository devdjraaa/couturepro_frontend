import VitrineShell from './VitrineChrome'
import { cn } from '@/utils/cn'

/* Carte créateur — carousel VitrineHome, grille CreateursPage, grille FavorisPage */
export function SkeletonCreatorCard({ className }) {
  return (
    <div className={cn('bg-card border border-edge rounded-lg p-5', className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className="skeleton w-[52px] h-[52px] rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="skeleton h-3 w-2/3 mb-4" />
      <div className="skeleton h-8 w-full rounded-xl" />
    </div>
  )
}

/* Carte galerie — section collections de VitrineHome */
export function SkeletonGalleryCard({ imgClass = 'aspect-[2/3]' }) {
  return (
    <div className="bg-card border border-edge rounded-xl overflow-hidden">
      <div className={cn('skeleton w-full', imgClass)} style={{ borderRadius: 0 }} />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-4 w-1/4 mt-1" />
      </div>
    </div>
  )
}

/* Page profil créateur — bannière + carte identité + stats + galerie */
export function SkeletonCreatorProfile() {
  return (
    <VitrineShell>
      {/* Bannière */}
      <div className="skeleton h-[180px] w-full" style={{ borderRadius: 0 }} />

      <div className="max-w-[1180px] mx-auto px-5">
        {/* Carte identité */}
        <div className="bg-card border border-edge rounded-lg -mt-[60px] relative p-6 flex flex-wrap items-start gap-5 shadow-lg">
          <div className="skeleton w-[88px] h-[88px] rounded-2xl shrink-0" />
          <div className="flex-1 min-w-[220px] space-y-3">
            <div className="skeleton h-7 w-44" />
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-14 w-full mt-1" />
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-[160px]">
            <div className="skeleton h-11 w-full rounded-xl" />
            <div className="skeleton h-11 w-full rounded-xl" />
            <div className="skeleton h-11 w-full rounded-xl" />
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-card border border-edge rounded-lg p-4 text-center space-y-2">
              <div className="skeleton h-6 w-10 mx-auto" />
              <div className="skeleton h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Galerie créations */}
        <div className="mt-10 space-y-4 pb-16">
          <div className="skeleton h-6 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="bg-card border border-edge rounded-lg overflow-hidden">
                <div className="skeleton h-[170px] w-full" style={{ borderRadius: 0 }} />
                <div className="p-3.5 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VitrineShell>
  )
}
