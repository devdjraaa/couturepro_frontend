import { useState } from 'react'
import { Archive, RotateCcw, User, ShoppingBag, Ruler } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/components/layout'
import { useArchives, useDesarchiver } from '@/hooks/useArchives'
import { formatDate } from '@/utils/formatDate'

export default function ArchivesPage() {
  const { t } = useTranslation()
  const { data: archives = [], isLoading } = useArchives()
  const desarchiver = useDesarchiver()
  const [confirming, setConfirming] = useState(null)

  const ENTITY_CONFIG = {
    client:   { icon: User,        label: t('archives.types.client'),   color: 'text-blue-500',   bg: 'bg-blue-50'   },
    commande: { icon: ShoppingBag, label: t('archives.types.commande'), color: 'text-amber-500',  bg: 'bg-amber-50'  },
    mesure:   { icon: Ruler,       label: t('archives.types.mesure'),   color: 'text-purple-500', bg: 'bg-purple-50' },
  }

  const handleDesarchiver = async (item) => {
    if (confirming !== item.entity_id) {
      setConfirming(item.entity_id)
      return
    }
    await desarchiver.mutateAsync({ entityType: item.entity_type, entityId: item.entity_id })
    setConfirming(null)
  }

  return (
    <AppLayout title={t('archives.titre')} showBack>
      <div className="px-4 pb-6 space-y-3 mt-4">

        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-subtle animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && archives.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Archive size={36} className="text-ghost" />
            <p className="text-sm text-dim">{t('archives.vide')}</p>
          </div>
        )}

        {archives.map(item => {
          const cfg   = ENTITY_CONFIG[item.entity_type] ?? ENTITY_CONFIG.client
          const Icon  = cfg.icon
          const isPending = desarchiver.isPending && desarchiver.variables?.entityId === item.entity_id

          return (
            <div key={`${item.entity_type}-${item.entity_id}`}
              className="bg-card border border-edge rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-[10px] text-ghost">{formatDate(item.archived_at)}</span>
                  </div>
                  <p className="text-sm font-medium text-ink truncate">{item.label}</p>
                  {item.archive_note && (
                    <p className="text-xs text-dim mt-0.5 line-clamp-2">"{item.archive_note}"</p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                {confirming === item.entity_id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirming(null)}
                      className="text-xs text-ghost px-3 py-1.5 rounded-xl border border-edge"
                    >
                      {t('commun.annuler')}
                    </button>
                    <button
                      onClick={() => handleDesarchiver(item)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 text-xs text-white bg-primary px-3 py-1.5 rounded-xl disabled:opacity-50"
                    >
                      <RotateCcw size={11} />
                      {isPending ? '…' : t('archives.confirmer_degeler')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDesarchiver(item)}
                    className="flex items-center gap-1.5 text-xs text-primary font-medium"
                  >
                    <RotateCcw size={12} />
                    {t('archives.degeler')}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </AppLayout>
  )
}
