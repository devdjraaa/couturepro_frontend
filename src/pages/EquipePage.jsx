import { useState } from 'react'
import { UserPlus, Users, Copy, CheckCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEquipe, useInviterMembre, useRemoveMembre } from '@/hooks/useEquipe'
import { usePlanLimit } from '@/hooks/usePlanFeature'
import { useAuth } from '@/contexts'
import { AppLayout } from '@/components/layout'
import { MembreCard, PermissionsGrid } from '@/components/equipe'
import { EmptyState, Skeleton, BottomSheet, Button, Input, Select } from '@/components/ui'

function CodeAccesModal({ membre, onClose }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(membre.code_acces)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-sm p-6 space-y-4">
        <div className="text-center">
          <p className="font-semibold text-content">{t('equipe.formulaire.titre')} ✓</p>
          <p className="text-sm text-content-secondary mt-1">
            Transmettez ce code d'accès à <strong>{membre.prenom} {membre.nom}</strong>.
            Il servira d'identifiant et de mot de passe initial.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3">
          <span className="flex-1 font-mono text-lg font-bold text-content tracking-widest text-center">
            {membre.code_acces}
          </span>
          <button onClick={copy} className="text-content-secondary hover:text-content transition-colors shrink-0">
            {copied ? <CheckCheck size={18} className="text-success" /> : <Copy size={18} />}
          </button>
        </div>

        <p className="text-xs text-content-secondary text-center">
          Le membre se connecte via <strong>Accès assistant</strong> sur la page de connexion.
        </p>

        <Button className="w-full" onClick={onClose}>{t('commun.confirmer')}</Button>
      </div>
    </div>
  )
}

export default function EquipePage() {
  const { can } = useAuth()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('membres')
  const [showInvite, setShowInvite] = useState(false)
  const [newMembre, setNewMembre] = useState(null)
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', role: 'assistant' })
  const [apiError, setApiError] = useState('')
  const { data: membres = [], isLoading } = useEquipe()
  const inviter = useInviterMembre()
  const remove  = useRemoveMembre()
  const { max } = usePlanLimit('max_membres', membres.length)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleInvite = async e => {
    e.preventDefault()
    setApiError('')
    try {
      const created = await inviter.mutateAsync(form)
      setShowInvite(false)
      setForm({ nom: '', prenom: '', telephone: '', role: 'assistant' })
      setNewMembre(created)
    } catch (err) {
      setApiError(err?.response?.data?.message ?? 'Une erreur est survenue.')
    }
  }

  const ROLE_OPTIONS = [
    { value: 'assistant', label: t('equipe.roles.assistant') },
    { value: 'membre',    label: t('equipe.roles.membre')    },
  ]
  const TABS = [
    { key: 'membres',     label: t('equipe.titre')            },
    { key: 'permissions', label: t('equipe.permissions_titre') },
  ]

  return (
    <AppLayout
      title={t('equipe.titre')}
      rightAction={
        activeTab === 'membres' && can('equipe.manage') && max !== 0 ? (
          <button onClick={() => setShowInvite(true)} className="p-2 text-dim">
            <UserPlus size={18} />
          </button>
        ) : null
      }
    >
      {/* Onglets */}
      {can('equipe.manage') && (
        <div className="flex border-b border-edge px-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-dim hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 space-y-2">
        {activeTab === 'membres' && (
          <>
            {max === 0 ? (
              <div className="flex flex-col items-center gap-4 py-10 px-6 text-center bg-surface border border-border rounded-2xl">
                <Users size={32} className="text-content-secondary" />
                <div>
                  <p className="font-semibold text-content mb-1">Membres d'équipe non inclus</p>
                  <p className="text-sm text-content-secondary">
                    Votre plan actuel ne permet pas d'ajouter des membres d'équipe. Passez à un plan supérieur pour collaborer.
                  </p>
                </div>
                <Button variant="secondary" onClick={() => window.location.href = '/parametres'}>
                  Voir les plans
                </Button>
              </div>
            ) : isLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
            ) : membres.length === 0 ? (
              <EmptyState
                icon={Users}
                title={t('equipe.vide.titre')}
                description={t('equipe.vide.description')}
              />
            ) : (
              membres.map(m => (
                <MembreCard key={m.id} membre={m} onRemove={id => remove.mutate(id)} />
              ))
            )}

            {max !== null && max > 0 && membres.length > 0 && (
              <p className="text-xs text-content-secondary text-center pt-2">
                {membres.length} / {max} membre{max > 1 ? 's' : ''}
              </p>
            )}
          </>
        )}

        {activeTab === 'permissions' && <PermissionsGrid />}
      </div>

      {/* Modal code d'accès après création */}
      {newMembre && (
        <CodeAccesModal membre={newMembre} onClose={() => setNewMembre(null)} />
      )}

      <BottomSheet isOpen={showInvite} onClose={() => setShowInvite(false)} title={t('equipe.formulaire.titre')}>
        <form onSubmit={handleInvite} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('equipe.formulaire.nom')} value={form.nom} onChange={set('nom')} placeholder="Koné" required />
            <Input label={t('equipe.formulaire.prenom')} value={form.prenom} onChange={set('prenom')} placeholder="Kadiatou" required />
          </div>
          <Input
            label={t('equipe.formulaire.telephone')}
            type="tel"
            value={form.telephone}
            onChange={set('telephone')}
            placeholder="+225 07 00 00 00 00"
          />
          <Select label={t('equipe.formulaire.role')} value={form.role} onChange={set('role')} options={ROLE_OPTIONS} />
          {apiError && <p className="text-sm text-danger">{apiError}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowInvite(false)} className="flex-1">
              {t('commun.annuler')}
            </Button>
            <Button type="submit" loading={inviter.isPending} className="flex-1">
              {t('equipe.formulaire.ajouter')}
            </Button>
          </div>
        </form>
      </BottomSheet>
    </AppLayout>
  )
}
