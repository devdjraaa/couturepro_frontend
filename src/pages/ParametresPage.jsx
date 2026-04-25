import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts'
import {
  useProfil, useUpdateProfil,
  useAtelierParametres, useUpdateAtelier,
  useChangerMotDePasse,
} from '@/hooks/useParametres'
import { useAbonnement, usePlans, useInitierPaiementAbonnement } from '@/hooks/useAbonnement'
import { useCountdown } from '@/hooks/useCountdown'
import { AppLayout } from '@/components/layout'
import { QuotaBar, PlanCard } from '@/components/abonnement'
import { TabBar, Input, Button, Skeleton } from '@/components/ui'

const TABS = [
  { key: 'profil',     label: 'Profil'     },
  { key: 'atelier',    label: 'Atelier'    },
  { key: 'abonnement', label: 'Abonnement' },
  { key: 'securite',   label: 'Sécurité'   },
]

function ProfilTab() {
  const { data: profil, isLoading } = useProfil()
  const update = useUpdateProfil()
  const [edits, setEdits] = useState(null)
  const current = edits ?? profil

  const set = key => e => setEdits(prev => ({ ...(prev ?? profil), [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    await update.mutateAsync(current)
    setEdits(null)
  }

  if (isLoading) return <Skeleton className="h-40 rounded-2xl" />

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nom" value={current?.nom ?? ''} onChange={set('nom')} required />
      <Input label="Téléphone" type="tel" value={current?.telephone ?? ''} onChange={set('telephone')} required />
      <Input label="Email" type="email" value={current?.email ?? ''} onChange={set('email')} />
      <Button type="submit" loading={update.isPending} className="w-full">
        Enregistrer
      </Button>
    </form>
  )
}

function AtelierTab() {
  const { data: atelier, isLoading } = useAtelierParametres()
  const update = useUpdateAtelier()
  const [edits, setEdits] = useState(null)
  const current = edits ?? atelier

  const set = key => e => setEdits(prev => ({ ...(prev ?? atelier), [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    await update.mutateAsync(current)
    setEdits(null)
  }

  if (isLoading) return <Skeleton className="h-40 rounded-2xl" />

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nom de l'atelier" value={current?.nom ?? ''} onChange={set('nom')} required />
      <Input label="Adresse" value={current?.adresse ?? ''} onChange={set('adresse')} />
      <Input label="Ville" value={current?.ville ?? ''} onChange={set('ville')} />
      <Button type="submit" loading={update.isPending} className="w-full">
        Enregistrer
      </Button>
    </form>
  )
}

function CountdownDisplay({ targetDate, statut }) {
  const cd = useCountdown(targetDate)

  if (!cd) return null
  if (cd.expired || statut === 'expire') {
    return <span className="text-sm font-semibold text-danger">Expiré</span>
  }

  const isUrgent = cd.days <= 1
  const color    = isUrgent ? 'text-danger' : cd.days <= 5 ? 'text-warning' : 'text-ink'
  const pad = n => String(n).padStart(2, '0')

  return (
    <span className={`text-sm font-mono font-semibold tabular-nums ${color}`}>
      {cd.days > 0 && `${cd.days}j `}{pad(cd.hours)}:{pad(cd.minutes)}:{pad(cd.seconds)}
    </span>
  )
}

function AbonnementTab() {
  const { data: abonnement } = useAbonnement()
  const { data: plans = [] } = usePlans()
  const initierPaiement = useInitierPaiementAbonnement()

  const handleUpgrade = async (niveau_cle) => {
    const result = await initierPaiement.mutateAsync({ niveau_cle })
    if (result?.checkout_url && result.checkout_url !== '#mock-payment') {
      window.open(result.checkout_url, '_blank')
    }
  }

  const statutLabel = {
    actif:  'Actif',
    essai:  'Période d\'essai',
    expire: 'Expiré',
    gele:   'Suspendu',
  }

  const statutColor = {
    actif:  'text-success',
    essai:  'text-primary',
    expire: 'text-danger',
    gele:   'text-warning',
  }

  return (
    <div className="space-y-5">
      <QuotaBar />

      {/* Statut actuel */}
      {abonnement && (
        <div className="bg-card border border-edge rounded-2xl divide-y divide-edge">
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-dim">Plan actuel</span>
            <span className="text-sm font-semibold text-ink">{abonnement.niveau_label ?? abonnement.niveau_cle ?? '—'}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-dim">Statut</span>
            <span className={`text-sm font-semibold ${statutColor[abonnement.statut] ?? 'text-ink'}`}>
              {statutLabel[abonnement.statut] ?? abonnement.statut}
            </span>
          </div>
          {abonnement.timestamp_expiration && abonnement.statut !== 'expire' && (
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-dim">Temps restant</span>
              <CountdownDisplay
                targetDate={abonnement.timestamp_expiration}
                statut={abonnement.statut}
              />
            </div>
          )}
          {abonnement.timestamp_expiration && (
            <div className="flex justify-between px-4 py-3">
              <span className="text-sm text-dim">
                {abonnement.statut === 'expire' ? 'Expiré le' : 'Expire le'}
              </span>
              <span className="text-sm text-ink">
                {new Date(abonnement.timestamp_expiration).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Plans disponibles */}
      <div>
        <p className="text-xs font-semibold text-dim uppercase tracking-wide mb-3">Plans disponibles</p>
        <div className="grid grid-cols-2 gap-3">
          {plans.map(plan => (
            <PlanCard
              key={plan.cle}
              plan={plan}
              isCurrent={abonnement?.niveau_cle === plan.cle}
              onUpgrade={handleUpgrade}
              isLoading={initierPaiement.isPending}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SecuriteTab() {
  const changerMdp = useChangerMotDePasse()
  const [form, setForm] = useState({ ancien: '', nouveau: '', confirmation: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (form.nouveau !== form.confirmation) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    try {
      await changerMdp.mutateAsync({ ancien: form.ancien, nouveau: form.nouveau })
      setSuccess(true)
      setForm({ ancien: '', nouveau: '', confirmation: '' })
    } catch (err) {
      setError(err.message || 'Erreur lors du changement de mot de passe')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Mot de passe actuel" type="password" value={form.ancien} onChange={set('ancien')} required />
      <Input label="Nouveau mot de passe" type="password" value={form.nouveau} onChange={set('nouveau')} required />
      <Input label="Confirmation" type="password" value={form.confirmation} onChange={set('confirmation')} required />
      {error   && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-success">Mot de passe modifié avec succès</p>}
      <Button type="submit" loading={changerMdp.isPending} className="w-full">
        Modifier le mot de passe
      </Button>
    </form>
  )
}

export default function ParametresPage() {
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profil')

  return (
    <AppLayout title="Paramètres">
      <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      <div className="p-4 space-y-4">
        {activeTab === 'profil'     && <ProfilTab />}
        {activeTab === 'atelier'    && <AtelierTab />}
        {activeTab === 'abonnement' && <AbonnementTab />}
        {activeTab === 'securite'   && <SecuriteTab />}

        <div className="pt-2 border-t border-edge space-y-2">
          <Link
            to="/parametres/theme"
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-card border border-edge text-sm text-ink hover:bg-subtle transition-colors"
          >
            <span>Apparence &amp; thème</span>
            <span className="text-ghost text-xs">›</span>
          </Link>
          <Link
            to="/parametres/communications"
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-card border border-edge text-sm text-ink hover:bg-subtle transition-colors"
          >
            <span>Communications WhatsApp</span>
            <span className="text-ghost text-xs">›</span>
          </Link>
          <Link
            to="/support"
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-card border border-edge text-sm text-ink hover:bg-subtle transition-colors"
          >
            <span>Support &amp; aide</span>
            <span className="text-ghost text-xs">›</span>
          </Link>
        </div>

        {activeTab === 'profil' && (
          <div className="pt-2">
            <Button variant="danger" className="w-full" onClick={logout}>
              Se déconnecter
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
