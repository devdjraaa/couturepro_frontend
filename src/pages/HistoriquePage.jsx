import { useState } from 'react'
import { History, Trash2 } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { EmptyState, Button } from '@/components/ui'
import { getHistorique, clearHistorique } from '@/utils/historique'

const TYPE_LABELS = {
  client_cree:      { label: 'Client ajouté',      color: 'bg-success/10 text-success' },
  client_modifie:   { label: 'Client modifié',      color: 'bg-primary/10 text-primary' },
  commande_creee:   { label: 'Commande créée',      color: 'bg-warning/10 text-warning' },
  commande_livree:  { label: 'Commande livrée',     color: 'bg-success/10 text-success' },
  paiement_ajoute:  { label: 'Paiement enregistré', color: 'bg-success/10 text-success' },
  mesure_sauvegardee: { label: 'Mesures sauvegardées', color: 'bg-accent/10 text-accent-600' },
}

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60)  return 'À l\'instant'
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function groupByDay(items) {
  const groups = {}
  items.forEach(item => {
    const day = new Date(item.at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    if (!groups[day]) groups[day] = []
    groups[day].push(item)
  })
  return Object.entries(groups)
}

export default function HistoriquePage() {
  const [items, setItems] = useState(() => getHistorique())

  const handleClear = () => {
    clearHistorique()
    setItems([])
  }

  const groups = groupByDay(items)

  return (
    <AppLayout
      title="Historique"
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
            title="Aucune activité"
            description="Vos actions récentes apparaîtront ici"
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
              Historique local · 8 derniers jours
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
