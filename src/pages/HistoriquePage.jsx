import { useState } from 'react'
import { History, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/components/layout'
import { EmptyState, Button } from '@/components/ui'
import { getHistorique, clearHistorique } from '@/utils/historique'

function useFormatDate() {
  const { t } = useTranslation()
  return (iso) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60)   return t('historique.a_instant')
    if (diff < 3600) return t('historique.il_y_a_min', { n: Math.floor(diff / 60) })
    if (diff < 86400) return t('historique.il_y_a_h', { n: Math.floor(diff / 3600) })
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }
}

function groupByDay(items) {
  const groups = {}
  items.forEach(item => {
    const day = new Date(item.at).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
    if (!groups[day]) groups[day] = []
    groups[day].push(item)
  })
  return Object.entries(groups)
}

export default function HistoriquePage() {
  const { t } = useTranslation()
  const [items, setItems] = useState(() => getHistorique())
  const formatDate = useFormatDate()

  const TYPE_LABELS = {
    client_cree:        { label: t('historique.types.client_cree'),        color: 'bg-success/10 text-success' },
    client_modifie:     { label: t('historique.types.client_modifie'),     color: 'bg-primary/10 text-primary' },
    commande_creee:     { label: t('historique.types.commande_creee'),     color: 'bg-warning/10 text-warning' },
    commande_livree:    { label: t('historique.types.commande_livree'),    color: 'bg-success/10 text-success' },
    paiement_ajoute:    { label: t('historique.types.paiement_ajoute'),    color: 'bg-success/10 text-success' },
    mesure_sauvegardee: { label: t('historique.types.mesure_sauvegardee'), color: 'bg-accent/10 text-accent-600' },
  }

  const handleClear = () => {
    clearHistorique()
    setItems([])
  }

  const groups = groupByDay(items)

  return (
    <AppLayout
      title={t('historique.titre')}
      showBack
      rightAction={
        items.length > 0 ? (
          <button onClick={handleClear} className="p-2 text-dim hover:text-danger transition-colors">
            <Trash2 size={18} />
          </button>
        ) : null
      }
    >
      <div className="p-4">
        {items.length === 0 ? (
          <EmptyState
            icon={History}
            title={t('historique.vide_titre')}
            description={t('historique.vide_description')}
          />
        ) : (
          <div className="space-y-5">
            {groups.map(([day, dayItems]) => (
              <div key={day}>
                <p className="text-xs font-semibold text-dim uppercase tracking-wide mb-2 capitalize">{day}</p>
                <div className="space-y-2">
                  {dayItems.map(item => {
                    const meta = TYPE_LABELS[item.type] ?? { label: item.type, color: 'bg-border text-dim' }
                    return (
                      <div key={item.id} className="bg-card border border-edge rounded-xl px-4 py-3 flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="text-sm text-ink flex-1 truncate">{item.label}</span>
                        <span className="text-xs text-ghost shrink-0">{formatDate(item.at)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            <p className="text-xs text-ghost text-center pt-2">
              {t('historique.local_label')}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
