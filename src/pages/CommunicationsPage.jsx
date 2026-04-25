import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { useAtelierParametres, useUpdateAtelier } from '@/hooks/useParametres'
import { AppLayout } from '@/components/layout'
import { Button, Skeleton } from '@/components/ui'

export default function CommunicationsPage() {
  const { data: atelier, isLoading } = useAtelierParametres()
  const updateAtelier = useUpdateAtelier()

  const [enabled, setEnabled] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (atelier) setEnabled(atelier.whatsapp_notifications_enabled ?? false)
  }, [atelier])

  const handleSave = async () => {
    setSuccess(false)
    try {
      await updateAtelier.mutateAsync({ whatsapp_notifications_enabled: enabled })
      setSuccess(true)
    } catch (_) {}
  }

  if (isLoading) {
    return (
      <AppLayout showBack title="Communications">
        <div className="p-4 space-y-3">
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout showBack title="Communications">
      <div className="p-4 space-y-5">
        <div className="bg-card border border-edge rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Rappels WhatsApp</p>
              <p className="text-xs text-dim mt-0.5">Envoi manuel via bouton</p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={enabled}
                onChange={e => { setEnabled(e.target.checked); setSuccess(false) }}
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-success' : 'bg-edge'}`} />
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm text-ink">
              Activer le bouton «&nbsp;Rappeler sur WhatsApp&nbsp;»
            </span>
          </label>

          <p className="text-xs text-dim bg-subtle rounded-xl px-3 py-2 leading-relaxed">
            Ce bouton permet de pré-remplir un message WhatsApp que vous envoyez vous-même
            depuis la fiche client ou la fiche commande. Aucun coût d'API n'est utilisé.
          </p>
        </div>

        {updateAtelier.isError && (
          <p className="text-sm text-danger px-1">
            {updateAtelier.error?.message ?? 'Impossible de sauvegarder pour l\'instant.'}
          </p>
        )}
        {success && (
          <p className="text-sm text-success px-1">Préférences enregistrées.</p>
        )}

        <Button
          className="w-full"
          loading={updateAtelier.isPending}
          onClick={handleSave}
          disabled={enabled === (atelier?.whatsapp_notifications_enabled ?? false)}
        >
          Enregistrer
        </Button>
      </div>
    </AppLayout>
  )
}
