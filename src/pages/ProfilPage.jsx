import { useState } from 'react'
import { useAuth } from '@/contexts'
import {
  useProfil, useUpdateProfil,
  useChangerMotDePasse,
} from '@/hooks/useParametres'
import { AppLayout } from '@/components/layout'
import { Input, Button, Skeleton } from '@/components/ui'

function ProfilSection() {
  const { data: profil, isLoading } = useProfil()
  const update = useUpdateProfil()
  const [edits, setEdits]   = useState(null)
  const [success, setSuccess] = useState(false)
  const current = edits ?? profil

  const set = key => e => setEdits(prev => ({ ...(prev ?? profil), [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    await update.mutateAsync(current)
    setEdits(null)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (isLoading) return <Skeleton className="h-40 rounded-2xl" />

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nom" value={current?.nom ?? ''} onChange={set('nom')} required />
      <Input label="Téléphone" type="tel" value={current?.telephone ?? ''} onChange={set('telephone')} required />
      <Input label="Email" type="email" value={current?.email ?? ''} onChange={set('email')} />
      {update.error && (
        <p className="text-sm text-danger">{update.error?.message || 'Erreur lors de la mise à jour'}</p>
      )}
      {success && <p className="text-sm text-success text-center">Profil mis à jour !</p>}
      <Button type="submit" loading={update.isPending} className="w-full">
        Enregistrer
      </Button>
    </form>
  )
}

function MotDePasseSection() {
  const changer = useChangerMotDePasse()
  const [form, setForm]   = useState({ ancien: '', nouveau: '', confirmation: '' })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.nouveau !== form.confirmation) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    try {
      await changer.mutateAsync({ ancien: form.ancien, nouveau: form.nouveau })
      setForm({ ancien: '', nouveau: '', confirmation: '' })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err?.message || 'Mot de passe actuel incorrect')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Mot de passe actuel" type="password" value={form.ancien} onChange={set('ancien')} required />
      <Input label="Nouveau mot de passe" type="password" value={form.nouveau} onChange={set('nouveau')} required />
      <Input label="Confirmer le nouveau mot de passe" type="password" value={form.confirmation} onChange={set('confirmation')} required />
      {error && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-success text-center">Mot de passe modifié !</p>}
      <Button type="submit" loading={changer.isPending} className="w-full">
        Changer le mot de passe
      </Button>
    </form>
  )
}

export default function ProfilPage() {
  const { user } = useAuth()

  return (
    <AppLayout title="Mon profil" showBack>
      <div className="p-4 space-y-6">
        {/* Identité */}
        <div>
          <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-3">Informations</h2>
          <div className="bg-card border border-edge rounded-2xl p-4">
            {user && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-edge">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {(user.prenom?.[0] ?? user.nom?.[0] ?? '?').toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-ink text-sm">{user.prenom} {user.nom}</p>
                  <p className="text-xs text-dim capitalize">{user.role}</p>
                </div>
              </div>
            )}
            <ProfilSection />
          </div>
        </div>

        {/* Sécurité */}
        <div>
          <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-3">Sécurité</h2>
          <div className="bg-card border border-edge rounded-2xl p-4">
            <MotDePasseSection />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
