import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCommunications, useUpdateCommunications } from '@/hooks/useParametres'
import { useAbonnement } from '@/hooks/useAbonnement'
import { AppLayout } from '@/components/layout'
import { Button, Skeleton } from '@/components/ui'
import { cn } from '@/utils/cn'

const DEFAULTS = {
  whatsapp_enabled:       false,
  confirmation_commande:  false,
  rappel_livraison_j2:    false,
  commande_prete:         false,
}

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
  const { t } = useTranslation()
  const { data: config, isLoading } = useCommunications()
  const update = useUpdateCommunications()
  const { data: abonnement } = useAbonnement()

  const [form, setForm]       = useState(DEFAULTS)
  const [success, setSuccess] = useState(false)

  const quotaFactures = abonnement?.quota_factures ?? null

  const TOGGLES = [
    {
      key:   'confirmation_commande',
      label: t('communications.whatsapp.confirmation_commande'),
      desc:  t('communications.whatsapp.confirmation_commande_desc'),
    },
    {
      key:   'rappel_livraison_j2',
      label: t('communications.whatsapp.rappel_j2'),
      desc:  t('communications.whatsapp.rappel_j2_desc'),
    },
    {
      key:   'commande_prete',
      label: t('communications.whatsapp.commande_prete'),
      desc:  t('communications.whatsapp.commande_prete_desc'),
    },
  ]

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
      <AppLayout showBack title={t('communications.titre')}>
        <div className="p-4 space-y-3">
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout showBack title={t('communications.titre')}>
      <div className="p-4 space-y-5">
        {/* Master toggle */}
        <div className="bg-card border border-edge rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <MessageCircle size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{t('communications.whatsapp.rappels')}</p>
                <p className="text-xs text-dim mt-0.5">{t('communications.whatsapp.bouton_manuel')}</p>
              </div>
            </div>
            <Toggle checked={form.whatsapp_enabled} onChange={set('whatsapp_enabled')} />
          </div>
          <p className="text-xs text-dim bg-subtle rounded-xl px-3 py-2 mt-3 leading-relaxed">
            {t('communications.whatsapp.sans_cout')}
          </p>
        </div>

        {/* 3 toggles indépendants */}
        <div>
          <p className="text-xs font-semibold text-dim uppercase tracking-wide mb-2">{t('communications.messages_automatiques')}</p>
          <div className="bg-card border border-edge rounded-2xl divide-y divide-edge">
            {TOGGLES.map(item => (
              <div key={item.key} className="flex items-center justify-between px-4 py-4 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="text-xs text-dim mt-0.5">{item.desc}</p>
                </div>
                <Toggle
                  checked={form[item.key]}
                  onChange={set(item.key)}
                  disabled={!form.whatsapp_enabled}
                />
              </div>
            ))}
          </div>
          {!form.whatsapp_enabled && (
            <p className="text-xs text-ghost text-center mt-2">{t('communications.activer_hint')}</p>
          )}
        </div>

        {/* Quota factures WhatsApp */}
        {quotaFactures && (
          <div className="bg-card border border-edge rounded-2xl px-4 py-3">
            <p className="text-xs font-semibold text-dim uppercase tracking-wide mb-2">{t('communications.factures_mois')}</p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 bg-edge rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{
                    width: quotaFactures.max === null
                      ? '0%'
                      : `${Math.min(100, Math.round((quotaFactures.utilise / quotaFactures.max) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-xs text-dim shrink-0">
                {quotaFactures.utilise} / {quotaFactures.max === null ? '∞' : quotaFactures.max}
              </p>
            </div>
          </div>
        )}

        {update.isError && (
          <p className="text-sm text-danger px-1">
            {update.error?.message ?? t('communications.erreur_sauvegarde')}
          </p>
        )}
        {success && (
          <p className="text-sm text-success px-1">{t('communications.succes')}</p>
        )}

        <Button className="w-full" loading={update.isPending} onClick={handleSave}>
          {t('commun.enregistrer')}
        </Button>
      </div>
    </AppLayout>
  )
}
