import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Plus, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts'
import {
  useProfil, useUpdateProfil,
  useAtelierParametres, useUpdateAtelier,
  useChangerMotDePasse,
  usePreferences, useUpdatePreferences,
} from '@/hooks/useParametres'
import { useAbonnement, usePlans, useInitierPaiementAbonnement, useActivateCode } from '@/hooks/useAbonnement'
import { useMesAteliers, useCreateSousAtelier } from '@/hooks/useMesAteliers'
import { usePlanLimit } from '@/hooks/usePlanFeature'
import { useCountdown } from '@/hooks/useCountdown'
import { AppLayout } from '@/components/layout'
import { QuotaBar, PlanCard } from '@/components/abonnement'
import { TabBar, Input, Select, Button, Skeleton, LanguageSwitcher } from '@/components/ui'

const DEVISES = [
  { value: 'XOF', label: 'FCFA (XOF)'            },
  { value: 'GNF', label: 'Franc Guinéen (GNF)'   },
  { value: 'XAF', label: 'Franc CFA CEMAC (XAF)' },
  { value: 'EUR', label: 'Euro (EUR)'             },
  { value: 'USD', label: 'Dollar (USD)'           },
  { value: 'GHS', label: 'Cedi (GHS)'             },
  { value: 'NGN', label: 'Naira (NGN)'            },
  { value: 'MAD', label: 'Dirham (MAD)'           },
]

function ProfilTab() {
  const { t } = useTranslation()
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
      <Input label={t('commun.nom')} value={current?.nom ?? ''} onChange={set('nom')} required />
      <Input label={t('commun.telephone')} type="tel" value={current?.telephone ?? ''} onChange={set('telephone')} required />
      <Input label={t('commun.email')} type="email" value={current?.email ?? ''} onChange={set('email')} />
      <Button type="submit" loading={update.isPending} className="w-full">
        {t('commun.enregistrer')}
      </Button>
    </form>
  )
}

function PreferencesTab() {
  const { t } = useTranslation()
  const UNITES = [
    { value: 'cm',     label: 'Centimètres (cm)' },
    { value: 'pouces', label: 'Pouces (in)'       },
  ]
  const { data: prefs, isLoading } = usePreferences()
  const update  = useUpdatePreferences()
  const { refreshAtelier } = useAuth()
  const [form, setForm]     = useState({ devise: 'XOF', unite_mesure: 'cm' })
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (prefs) setForm({ devise: prefs.devise ?? 'XOF', unite_mesure: prefs.unite_mesure ?? 'cm' })
  }, [prefs])

  const handleSubmit = async e => {
    e.preventDefault()
    setSuccess(false)
    await update.mutateAsync(form)
    await refreshAtelier()
    setSuccess(true)
  }

  if (isLoading) return <Skeleton className="h-40 rounded-2xl" />

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label={t('parametres.preferences.devise')}
        value={form.devise}
        onChange={e => setForm(f => ({ ...f, devise: e.target.value }))}
        options={DEVISES}
      />
      <Select
        label={t('parametres.preferences.unite_mesure')}
        value={form.unite_mesure}
        onChange={e => setForm(f => ({ ...f, unite_mesure: e.target.value }))}
        options={UNITES}
      />
      <div>
        <label className="block text-xs font-medium text-dim mb-2">{t('parametres.preferences.langue')}</label>
        <LanguageSwitcher />
      </div>
      {success && <p className="text-sm text-success">{t('parametres.preferences.succes')}</p>}
      <Button type="submit" loading={update.isPending} className="w-full">
        {t('commun.enregistrer')}
      </Button>
    </form>
  )
}

function AtelierTab() {
  const { t } = useTranslation()
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
      <Input label={t('parametres.atelier.nom')} value={current?.nom ?? ''} onChange={set('nom')} required />
      <Input label={t('parametres.atelier.adresse')} value={current?.adresse ?? ''} onChange={set('adresse')} />
      <Input label={t('parametres.atelier.ville')} value={current?.ville ?? ''} onChange={set('ville')} />
      <Button type="submit" loading={update.isPending} className="w-full">
        {t('commun.enregistrer')}
      </Button>
    </form>
  )
}

function CountdownDisplay({ targetDate, statut }) {
  const { t } = useTranslation()
  const cd = useCountdown(targetDate)

  if (!cd) return null
  if (cd.expired || statut === 'expire') {
    return <span className="text-sm font-semibold text-danger">{t('parametres.abonnement.statuts.expire')}</span>
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

function ActiverCodeSection() {
  const { t } = useTranslation()
  const activerCode = useActivateCode()
  const [code, setCode]     = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError]   = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await activerCode.mutateAsync(code.trim().toUpperCase())
      setSuccess(res?.message ?? t('parametres.abonnement.active_succes'))
      setCode('')
    } catch (err) {
      setError(err?.message || t('parametres.abonnement.code_invalide'))
    }
  }

  return (
    <div className="bg-card border border-edge rounded-2xl p-4 space-y-3">
      <p className="text-sm font-semibold text-ink">{t('parametres.abonnement.activer_code_titre')}</p>
      <p className="text-xs text-dim">{t('parametres.abonnement.activer_code_desc')}</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX-XXXX"
          className="font-mono tracking-widest flex-1"
          maxLength={14}
          required
        />
        <Button type="submit" loading={activerCode.isPending} className="shrink-0">
          {t('parametres.abonnement.activer_btn')}
        </Button>
      </form>
      {error   && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-success">{success}</p>}
    </div>
  )
}

function AbonnementTab() {
  const { t } = useTranslation()
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
    actif:  t('parametres.abonnement.statuts.actif'),
    essai:  t('parametres.abonnement.statuts.essai'),
    expire: t('parametres.abonnement.statuts.expire'),
    gele:   t('parametres.abonnement.statuts.gele'),
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

      {abonnement && (
        <div className="bg-card border border-edge rounded-2xl divide-y divide-edge">
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-dim">{t('parametres.abonnement.plan_actuel')}</span>
            <span className="text-sm font-semibold text-ink">{abonnement.niveau_label ?? abonnement.niveau_cle ?? '—'}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-dim">{t('commun.statut')}</span>
            <span className={`text-sm font-semibold ${statutColor[abonnement.statut] ?? 'text-ink'}`}>
              {statutLabel[abonnement.statut] ?? abonnement.statut}
            </span>
          </div>
          {abonnement.timestamp_expiration && abonnement.statut !== 'expire' && (
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-dim">{t('parametres.abonnement.temps_restant')}</span>
              <CountdownDisplay
                targetDate={abonnement.timestamp_expiration}
                statut={abonnement.statut}
              />
            </div>
          )}
          {abonnement.timestamp_expiration && (
            <div className="flex justify-between px-4 py-3">
              <span className="text-sm text-dim">
                {abonnement.statut === 'expire' ? t('parametres.abonnement.expire_le_passe') : t('parametres.abonnement.expire_le')}
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

      <ActiverCodeSection />

      <div>
        <p className="text-xs font-semibold text-dim uppercase tracking-wide mb-3">{t('parametres.abonnement.plans_disponibles')}</p>
        <div className="grid grid-cols-2 gap-3">
          {plans.map(plan => (
            <PlanCard
              key={plan.cle}
              plan={plan}
              isCurrent={abonnement?.niveau_cle === plan.cle}
              abonnementStatut={abonnement?.statut}
              onUpgrade={handleUpgrade}
              isLoading={initierPaiement.isPending}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function MesAteliersTab() {
  const { t } = useTranslation()
  const { atelier: atelierActif, switchAtelier } = useAuth()
  const { data: ateliers = [], isLoading } = useMesAteliers()
  const create = useCreateSousAtelier()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: '', ville: '' })
  const [apiError, setApiError] = useState('')

  const sousCount = ateliers.filter(a => !a.is_maitre).length
  const { allowed: canAdd, max: maxSousAteliers } = usePlanLimit('max_sous_ateliers', sousCount)

  const handleCreate = async e => {
    e.preventDefault()
    setApiError('')
    try {
      await create.mutateAsync(form)
      setShowForm(false)
      setForm({ nom: '', ville: '' })
    } catch (err) {
      setApiError(err?.response?.data?.message ?? t('erreurs.inconnu'))
    }
  }

  if (isLoading) return <Skeleton className="h-32 rounded-2xl" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-dim">
          {ateliers.length} atelier{ateliers.length > 1 ? 's' : ''}
          {maxSousAteliers !== null && maxSousAteliers > 0 && (
            <span className="text-ghost ml-1">({sousCount}/{maxSousAteliers} sous-atelier{maxSousAteliers > 1 ? 's' : ''})</span>
          )}
        </p>
        {canAdd ? (
          <button
            onClick={() => setShowForm(x => !x)}
            className="flex items-center gap-1.5 text-sm text-primary font-medium"
          >
            <Plus size={15} /> {t('parametres.ateliers_tab.ajouter')}
          </button>
        ) : maxSousAteliers === 0 ? (
          <span className="text-xs text-ghost">{t('parametres.ateliers_tab.non_disponible')}</span>
        ) : null}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-edge rounded-2xl p-4 space-y-3">
          <Input label={t('parametres.ateliers_tab.form_nom')} value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required />
          <Input label={t('parametres.ateliers_tab.form_ville')} value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} />
          {apiError && <p className="text-sm text-danger">{apiError}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">{t('commun.annuler')}</Button>
            <Button type="submit" loading={create.isPending} className="flex-1">{t('parametres.ateliers_tab.creer')}</Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {ateliers.map(a => {
          const isActive = a.id === atelierActif?.id
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors cursor-pointer ${
                isActive ? 'border-primary bg-primary/5' : 'border-edge bg-card hover:bg-subtle'
              }`}
              onClick={() => switchAtelier(a)}
            >
              <Building2 size={18} className={isActive ? 'text-primary' : 'text-dim'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink truncate">{a.nom}</p>
                  {a.is_maitre && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">{t('parametres.ateliers_tab.maitre')}</span>
                  )}
                </div>
                <p className="text-xs text-dim mt-0.5">
                  {a.ville ? `${a.ville} · ` : ''}{a.clients_count ?? 0} {t('clients.titre').toLowerCase()} · {a.commandes_count ?? 0} {t('commandes.titre').toLowerCase()}
                </p>
              </div>
              {isActive && <CheckCircle2 size={16} className="text-primary shrink-0" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SecuriteTab() {
  const { t } = useTranslation()
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
      setError(t('auth.inscription.mdp_non_concordants'))
      return
    }
    try {
      await changerMdp.mutateAsync({ ancien: form.ancien, nouveau: form.nouveau })
      setSuccess(true)
      setForm({ ancien: '', nouveau: '', confirmation: '' })
    } catch (err) {
      setError(err.message || t('erreurs.inconnu'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label={t('parametres.securite.ancien_mdp')} type="password" value={form.ancien} onChange={set('ancien')} required />
      <Input label={t('parametres.securite.nouveau_mdp')} type="password" value={form.nouveau} onChange={set('nouveau')} required />
      <Input label={t('parametres.securite.confirmer_mdp')} type="password" value={form.confirmation} onChange={set('confirmation')} required />
      {error   && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-success">{t('parametres.securite.succes')}</p>}
      <Button type="submit" loading={changerMdp.isPending} className="w-full">
        {t('parametres.securite.modifier')}
      </Button>
    </form>
  )
}

export default function ParametresPage() {
  const { logout } = useAuth()
  const { t } = useTranslation()

  const TABS = [
    { key: 'profil',       label: t('parametres.onglets.profil')       },
    { key: 'atelier',      label: t('parametres.onglets.atelier')      },
    { key: 'ateliers',     label: t('parametres.onglets.ateliers')     },
    { key: 'preferences',  label: t('parametres.onglets.preferences')  },
    { key: 'abonnement',   label: t('parametres.onglets.abonnement')   },
    { key: 'securite',     label: t('parametres.onglets.securite')     },
  ]

  const [activeTab, setActiveTab] = useState('profil')

  return (
    <AppLayout title={t('parametres.titre')}>
      <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      <div className="p-4 space-y-4">
        {activeTab === 'profil'      && <ProfilTab />}
        {activeTab === 'atelier'     && <AtelierTab />}
        {activeTab === 'ateliers'    && <MesAteliersTab />}
        {activeTab === 'preferences' && <PreferencesTab />}
        {activeTab === 'abonnement'  && <AbonnementTab />}
        {activeTab === 'securite'    && <SecuriteTab />}

        <div className="pt-2 border-t border-edge space-y-2">
          <Link
            to="/parametres/theme"
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-card border border-edge text-sm text-ink hover:bg-subtle transition-colors"
          >
            <span>{t('parametres.liens.theme')}</span>
            <span className="text-ghost text-xs">›</span>
          </Link>
          <Link
            to="/parametres/communications"
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-card border border-edge text-sm text-ink hover:bg-subtle transition-colors"
          >
            <span>{t('parametres.liens.communications')}</span>
            <span className="text-ghost text-xs">›</span>
          </Link>
          <Link
            to="/support"
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-card border border-edge text-sm text-ink hover:bg-subtle transition-colors"
          >
            <span>{t('parametres.liens.support')}</span>
            <span className="text-ghost text-xs">›</span>
          </Link>
        </div>

        {activeTab === 'profil' && (
          <div className="pt-2">
            <Button variant="danger" className="w-full" onClick={logout}>
              {t('auth.deconnexion')}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
