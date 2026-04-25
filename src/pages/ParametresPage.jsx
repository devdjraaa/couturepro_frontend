import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts'
import {
  useProfil, useUpdateProfil,
  useAtelierParametres, useUpdateAtelier,
  useChangerMotDePasse,
} from '@/hooks/useParametres'
import { useAbonnement } from '@/hooks/useAbonnement'
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

function AbonnementTab() {
  const { data: abonnement } = useAbonnement()
  return (
    <div className="space-y-4">
      <QuotaBar />
      <div className="space-y-3">
        <PlanCard plan="gratuit" isCurrent={abonnement?.niveau === 'gratuit'} />
        <PlanCard plan="pro"     isCurrent={abonnement?.niveau === 'pro'}     />
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
