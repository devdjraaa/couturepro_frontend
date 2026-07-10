import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Building2, Plus, CheckCircle2, ImagePlus, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts'
import {
  useProfil, useUpdateProfil,
  useAtelierParametres, useUpdateAtelier,
  useChangerMotDePasse,
  usePreferences, useUpdatePreferences,
  useFactureSettings, useUpdateFactureSettings, useUploadFactureLogo,
} from '@/hooks/useParametres'
import { useAbonnement, usePlans, useInitierPaiementAbonnement, useActivateCode } from '@/hooks/useAbonnement'
import { useMesAteliers, useCreateSousAtelier } from '@/hooks/useMesAteliers'
import { usePlanLimit, usePlanFeature } from '@/hooks/usePlanFeature'
import { useCountdown } from '@/hooks/useCountdown'
import { useAccountType } from '@/hooks/useAccountType'
import { AppLayout } from '@/components/layout'
import { QuotaBar, PlanCard, FeatureGate } from '@/components/abonnement'
import { TabBar, Input, Select, Button, Skeleton, LanguageSwitcher } from '@/components/ui'
import { parametresService } from '@/services/parametresService'
import { cn } from '@/utils/cn'

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
      <Input label={t('commun.telephone')} type="text" inputMode="tel" value={current?.telephone ?? ''} onChange={set('telephone')} placeholder="ex : +229 97 00 00 00" required />
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
  const { atelier: authAtelier } = useAuth()
  const { data: atelierData, isLoading } = useAtelierParametres()
  // Fallback sur l'atelier du contexte : le fetch dédié (/auth/me) peut échouer
  // ou être annulé → sans ce repli, le formulaire s'ouvrait VIDE (risque d'écraser
  // le nom de l'atelier à l'enregistrement).
  const atelier = atelierData ?? authAtelier
  const update = useUpdateAtelier()
  const [edits, setEdits] = useState(null)
  const current = edits ?? atelier

  const set = key => e => setEdits(prev => ({ ...(prev ?? atelier), [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    await update.mutateAsync(current)
    setEdits(null)
  }

  if (isLoading && !atelier) return <Skeleton className="h-40 rounded-2xl" />

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

function FactureTab() {
  const fileRef = useRef(null)
  const { data: settings, isLoading } = useFactureSettings()
  const update    = useUpdateFactureSettings()
  const uploadLogo = useUploadFactureLogo()
  const { available: personnaliseDispo } = usePlanFeature('facture_personnalisee')

  const [form, setForm] = useState({
    format_facture:    'standard',
    facture_ifu:       '',
    facture_rccm:      '',
    facture_pied_page: '',
    assujetti_tva:     false,
    emecef_token:      '', // jamais prérempli ; vide = on conserve l'existant
  })

  useEffect(() => {
    if (settings) {
      setForm({
        format_facture:    settings.format_facture    ?? 'standard',
        facture_ifu:       settings.facture_ifu        ?? '',
        facture_rccm:      settings.facture_rccm       ?? '',
        facture_pied_page: settings.facture_pied_page  ?? '',
        assujetti_tva:     settings.assujetti_tva      ?? false,
        emecef_token:      '',
      })
    }
  }, [settings])

  const dispo = settings?.personnalisation_dispo ?? personnaliseDispo

  const handleSubmit = async (e) => {
    e.preventDefault()
    await update.mutateAsync(form)
  }

  const handleLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadLogo.mutateAsync(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  if (isLoading) return <Skeleton className="h-40 rounded-2xl" />

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-card border border-edge rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-ink">Format de facture</p>

        <label className="flex items-start gap-3 p-3 rounded-xl border border-edge cursor-pointer hover:bg-subtle transition-colors">
          <input
            type="radio"
            name="format_facture"
            value="standard"
            checked={form.format_facture === 'standard'}
            onChange={() => setForm(f => ({ ...f, format_facture: 'standard' }))}
            className="mt-1 accent-primary"
          />
          <div>
            <p className="text-sm font-medium text-ink">Standard</p>
            <p className="text-xs text-ghost">Facture simple intégrée à l'application, incluse gratuitement.</p>
          </div>
        </label>

        <label className={cn(
          'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors',
          dispo ? 'border-edge hover:bg-subtle' : 'border-edge opacity-60 cursor-not-allowed',
        )}>
          <input
            type="radio"
            name="format_facture"
            value="personnalise"
            checked={form.format_facture === 'personnalise'}
            disabled={!dispo}
            onChange={() => setForm(f => ({ ...f, format_facture: 'personnalise' }))}
            className="mt-1 accent-primary"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-ink flex items-center gap-1.5">
              Personnalisée
              {!dispo && <Lock size={12} className="text-ghost" />}
            </p>
            <p className="text-xs text-ghost">Logo, références IFU/RCCM et pied de page personnalisés.</p>
          </div>
        </label>

        {!dispo && (
          <FeatureGate
            featureKey="facture_personnalisee"
            featureName="La facture personnalisée"
            variant="inline"
          />
        )}
      </div>

      {form.format_facture === 'personnalise' && dispo && (
        <div className="bg-card border border-edge rounded-2xl p-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-ink mb-2">Logo de l'atelier</p>
            <div className="flex items-center gap-3">
              {settings?.facture_logo_url ? (
                <img src={settings.facture_logo_url} alt="Logo" className="w-14 h-14 rounded-xl object-contain border border-edge bg-subtle" />
              ) : (
                <div className="w-14 h-14 rounded-xl border border-dashed border-edge flex items-center justify-center text-ghost">
                  <ImagePlus size={18} />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadLogo.isPending}
                className="px-3 py-2 rounded-xl border border-edge bg-subtle text-sm font-medium text-ink hover:bg-card disabled:opacity-50 transition-colors"
              >
                {uploadLogo.isPending ? 'Envoi…' : 'Choisir un logo'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleLogo}
              />
            </div>
          </div>

          <Input
            label="IFU"
            value={form.facture_ifu}
            onChange={e => setForm(f => ({ ...f, facture_ifu: e.target.value }))}
            placeholder="Numéro IFU"
          />
          <Input
            label="RCCM"
            value={form.facture_rccm}
            onChange={e => setForm(f => ({ ...f, facture_rccm: e.target.value }))}
            placeholder="Numéro RCCM"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Pied de page</label>
            <textarea
              value={form.facture_pied_page}
              onChange={e => setForm(f => ({ ...f, facture_pied_page: e.target.value }))}
              maxLength={1000}
              rows={3}
              placeholder="Ex : Conditions de garantie, mentions légales…"
              className="w-full bg-card text-ink placeholder:text-ghost border border-edge rounded-xl px-3 py-2 text-sm font-sans transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* Fiscalité / facture normalisée DGI (e-MECeF) */}
      <div className="bg-card border border-edge rounded-2xl p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-ink">Facturation normalisée (DGI)</p>
          <p className="text-xs text-ghost">Pour les ateliers assujettis à la TVA : connectez votre compte e-MECeF pour émettre des factures normalisées (Code DGI + QR). Pensez à renseigner votre IFU.</p>
        </div>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-ink">Assujetti à la TVA</span>
          <input type="checkbox" checked={form.assujetti_tva} onChange={e => setForm(f => ({ ...f, assujetti_tva: e.target.checked }))} />
        </label>
        {form.assujetti_tva && (
          <Input
            label="Jeton e-MECeF"
            value={form.emecef_token}
            onChange={e => setForm(f => ({ ...f, emecef_token: e.target.value }))}
            placeholder={settings?.emecef_configure ? '•••••• déjà configuré (laisser vide pour conserver)' : 'Collez votre jeton e-MECeF'}
          />
        )}
      </div>

      <Button type="submit" loading={update.isPending} className="w-full">
        Enregistrer
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
      // Sur Capacitor, on navigue dans la WebView elle-même : ainsi quand FedaPay
      // redirige vers `https://localhost/paiement/retour`, la SPA peut intercepter
      // la route. Sur web, on ouvre dans un nouvel onglet (UX classique).
      const isCapacitor = window.Capacitor?.isNativePlatform?.()
      if (isCapacitor) {
        window.location.href = result.checkout_url
      } else {
        window.open(result.checkout_url, '_blank')
      }
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
          {plans
            // Le plan gratuit n'est pas souscriptible (attribué à la création) :
            // on ne l'affiche que s'il est le plan actuel de l'utilisateur.
            .filter(plan => Number(plan.prix_xof) > 0 || abonnement?.niveau_cle === plan.cle)
            .map(plan => (
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
  const { logout } = useAuth()
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
      // Sécurité : le changement révoque toutes les sessions → on déconnecte
      // (le temps de lire le message) pour forcer une reconnexion.
      setTimeout(() => { logout() }, 1800)
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

function TypeCompteTab() {
  const { t } = useTranslation()
  const { atelier, refreshAtelier } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(atelier?.type || 'artisan')
  const [msg, setMsg] = useState('')

  const types = [
    { value: 'artisan',  label: t('parametres.type_compte.artisan'),  desc: t('parametres.type_compte.artisan_desc') },
    { value: 'designer', label: t('parametres.type_compte.designer'), desc: t('parametres.type_compte.designer_desc') },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selected === atelier?.type) return
    setLoading(true); setMsg('')
    try {
      await parametresService.changerTypeCompte(selected)
      if (refreshAtelier) await refreshAtelier()
      setMsg(t('parametres.type_compte.succes'))
    } catch {
      setMsg(t('parametres.type_compte.erreur'))
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-dim">{t('parametres.type_compte.description')}</p>
      <div className="space-y-2">
        {types.map(tp => (
          <label
            key={tp.value}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition',
              selected === tp.value ? 'border-primary bg-primary/5' : 'border-edge bg-card',
            )}
          >
            <input
              type="radio" name="type_compte" value={tp.value}
              checked={selected === tp.value}
              onChange={() => setSelected(tp.value)}
              className="mt-1"
            />
            <div>
              <p className="font-semibold text-sm text-ink">{tp.label}</p>
              <p className="text-xs text-dim">{tp.desc}</p>
            </div>
          </label>
        ))}
      </div>
      {msg && <p className={cn('text-sm', msg.includes('mis à jour') || msg.includes('updated') ? 'text-success' : 'text-danger')}>{msg}</p>}
      <Button type="submit" loading={loading} disabled={selected === atelier?.type} className="w-full">
        {t('parametres.type_compte.confirmer')}
      </Button>
    </form>
  )
}

export default function ParametresPage() {
  const { logout } = useAuth()
  const { t } = useTranslation()
  const { isDesigner } = useAccountType()

  const TABS = [
    { key: 'profil',       label: t('parametres.onglets.profil')       },
    { key: 'atelier',      label: t('parametres.onglets.atelier')      },
    // « Mes ateliers » (multi-ateliers) = designer uniquement.
    ...(isDesigner ? [{ key: 'ateliers', label: t('parametres.onglets.ateliers') }] : []),
    { key: 'preferences',  label: t('parametres.onglets.preferences')  },
    { key: 'facture',      label: t('parametres.onglets.facture')      },
    { key: 'abonnement',   label: t('parametres.onglets.abonnement')   },
    // « Type de compte » retiré du user : mutation artisan↔designer réservée à l'admin
    // (évite qu'un artisan se change en designer pour contourner l'offre). Voir feature admin.
    { key: 'securite',     label: t('parametres.onglets.securite')     },
  ]

  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.state?.tab ?? 'profil')

  return (
    <AppLayout title={t('parametres.titre')} showBack>
      <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      <div className="p-4 space-y-4">
        {activeTab === 'profil'      && <ProfilTab />}
        {activeTab === 'atelier'     && <AtelierTab />}
        {activeTab === 'ateliers'    && isDesigner && <MesAteliersTab />}
        {activeTab === 'preferences' && <PreferencesTab />}
        {activeTab === 'facture'     && <FactureTab />}
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
