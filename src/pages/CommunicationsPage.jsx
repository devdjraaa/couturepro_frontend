import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { useCommunications, useUpdateCommunications } from '@/hooks/useParametres'
import { AppLayout } from '@/components/layout'
import { Button, Skeleton } from '@/components/ui'
import { cn } from '@/utils/cn'

const DEFAULTS = {
  whatsapp_enabled:       false,
  confirmation_commande:  false,
  rappel_livraison_j2:    false,
  commande_prete:         false,
}

const TOGGLES = [
  {
    key:   'confirmation_commande',
    label: 'Confirmation de commande',
    desc:  'Envoyer un message quand une commande est créée',
  },
  {
    key:   'rappel_livraison_j2',
    label: 'Rappel J-2 avant livraison',
    desc:  'Rappeler le client 2 jours avant la date de livraison prévue',
  },
  {
    key:   'commande_prete',
    label: 'Commande prête',
    desc:  'Informer le client quand sa commande est prête à récupérer',
  },
]

function Toggle({ checked, onChange, disabled }) {
  return (
    <label className={cn('relative cursor-pointer shrink-0', disabled && 'opacity-40 pointer-events-none')}>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-success' : 'bg-edge'}`} />
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </label>
  )
}

export default function CommunicationsPage() {
  const { data: config, isLoading } = useCommunications()
  const update = useUpdateCommunications()

  const [form, setForm]       = useState(DEFAULTS)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (config) setForm({ ...DEFAULTS, ...config })
  }, [config])

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.checked }))
    setSuccess(false)
  }

  const handleSave = async () => {
    setSuccess(false)
    try {
      await update.mutateAsync(form)
      setSuccess(true)
    } catch (_) {}
  }

  if (isLoading) {
    return (
      <AppLayout showBack title="Communications">
        <div className="p-4 space-y-3">
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout showBack title="Communications">
      <div className="p-4 space-y-5">
        {/* Master toggle */}
        <div className="bg-card border border-edge rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <MessageCircle size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Rappels WhatsApp</p>
                <p className="text-xs text-dim mt-0.5">Bouton manuel depuis les fiches</p>
              </div>
            </div>
            <Toggle checked={form.whatsapp_enabled} onChange={set('whatsapp_enabled')} />
          </div>
          <p className="text-xs text-dim bg-subtle rounded-xl px-3 py-2 mt-3 leading-relaxed">
            Aucun coût d'API — vous rédigez et envoyez vous-même le message depuis WhatsApp.
          </p>
        </div>

        {/* 3 toggles indépendants */}
        <div>
          <p className="text-xs font-semibold text-dim uppercase tracking-wide mb-2">Messages automatiques</p>
          <div className="bg-card border border-edge rounded-2xl divide-y divide-edge">
            {TOGGLES.map(t => (
              <div key={t.key} className="flex items-center justify-between px-4 py-4 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{t.label}</p>
                  <p className="text-xs text-dim mt-0.5">{t.desc}</p>
                </div>
                <Toggle
                  checked={form[t.key]}
                  onChange={set(t.key)}
                  disabled={!form.whatsapp_enabled}
                />
              </div>
            ))}
          </div>
          {!form.whatsapp_enabled && (
            <p className="text-xs text-ghost text-center mt-2">Activez les rappels WhatsApp pour configurer</p>
          )}
        </div>

        {update.isError && (
          <p className="text-sm text-danger px-1">
            {update.error?.message ?? 'Impossible de sauvegarder pour l\'instant.'}
          </p>
        )}
        {success && (
          <p className="text-sm text-success px-1">Préférences enregistrées.</p>
        )}

        <Button className="w-full" loading={update.isPending} onClick={handleSave}>
          Enregistrer
        </Button>
      </div>
    </AppLayout>
  )
}
