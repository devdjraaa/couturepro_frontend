import { useState, useEffect, useRef } from 'react'
import { sanitizePhoneInput } from '@/utils/phoneInput'
import { Link, useLocation } from 'react-router-dom'
import { Building2, Plus, CheckCircle2, ImagePlus, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts'
import {
  useProfil, useUpdateProfil,
  useAtelierParametres, useUpdateAtelier,
  useChangerMotDePasse,
  usePreferences, useUpdatePreferences,
  useFactureSettings, useUpdateFactureSettings, useUploadFactureLogo,
} from '@/hooks/useParametres'
import { useAbonnement, usePlans, useInitierPaiementAbonnement, useActivateCode, useCodePromo } from '@/hooks/useAbonnement'
import { useMesAteliers, useCreateSousAtelier } from '@/hooks/useMesAteliers'
import { usePlanLimit, usePlanFeature } from '@/hooks/usePlanFeature'
import { useCountdown } from '@/hooks/useCountdown'
import { useAccountType } from '@/hooks/useAccountType'
import { AppLayout } from '@/components/layout'
import { QuotaBar, PlanCard, FeatureGate } from '@/components/abonnement'
import { TabBar, Input, Select, Button, Skeleton, LanguageSwitcher, BottomSheet } from '@/components/ui'
import { parametresService } from '@/services/parametresService'
import { abonnementService } from '@/services/abonnementService'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import Avatar from '@/components/ui/Avatar'

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

/** Photo de profil : choisir, remplacer, ou revenir aux initiales. */
function PhotoProfil({ photoUrl, nom }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const champ = useRef(null)
  const [envoi, setEnvoi] = useState(false)

  const rafraichir = () => {
    qc.invalidateQueries({ queryKey: ['profil'] })
    qc.invalidateQueries({ queryKey: ['auth', 'me'] })
  }

  const choisir = async (e) => {
    const fichier = e.target.files?.[0]
    if (!fichier) return
    setEnvoi(true)
    try {
      await parametresService.envoyerPhotoProfil(fichier)
      rafraichir()
      toast.success(t('profil.photo_enregistree'))
    } catch (err) {
      toast.error(err?.message || t('erreurs.inconnu'))
    } finally {
      setEnvoi(false)
      if (champ.current) champ.current.value = ''
    }
  }

  const retirer = async () => {
    setEnvoi(true)
    try {
      await parametresService.supprimerPhotoProfil()
      rafraichir()
    } catch (err) {
      toast.error(err?.message || t('erreurs.inconnu'))
    } finally { setEnvoi(false) }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar nom={nom} photo_url={photoUrl} size="xl" />
      <div className="flex flex-col gap-1.5">
        <button type="button" onClick={() => champ.current?.click()} disabled={envoi}
                className="text-sm font-semibold text-primary disabled:opacity-50 text-left">
          {photoUrl ? t('profil.photo_changer') : t('profil.photo_ajouter')}
        </button>
        {photoUrl && (
          <button type="button" onClick={retirer} disabled={envoi}
                  className="text-xs text-ghost hover:text-danger disabled:opacity-50 text-left">
            {t('profil.photo_retirer')}
          </button>
        )}
        <input ref={champ} type="file" accept="image/jpeg,image/png,image/webp"
               onChange={choisir} className="hidden" />
      </div>
    </div>
  )
}

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
      {/* Photo de profil — elle n'existait pas : le propriétaire restait sur ses
          initiales sans aucun moyen d'y remédier, alors que les clients, eux,
          ont une photo depuis toujours. */}
      <PhotoProfil photoUrl={current?.photo_url} nom={current?.nom} />

      {/* ⚠️ Ce formulaire divergeait de celui de /parametres/profil : le prénom
          et l'anniversaire n'y figuraient pas. C'est ce qui a produit le retour
          « le prénom n'est pas affiché dans Réglages > Profil » — il l'était sur
          une page, pas sur l'autre. Les deux portent désormais les mêmes champs. */}
      <Input label={t('commun.prenom')} value={current?.prenom ?? ''} onChange={set('prenom')} />
      <Input label={t('commun.nom')} value={current?.nom ?? ''} onChange={set('nom')} required />
      <Input label={t('commun.telephone')} type="text" inputMode="tel" value={current?.telephone ?? ''} onChange={(e) => set('telephone')({ target: { value: sanitizePhoneInput(e.target.value) } })} placeholder="ex : +229 97 00 00 00" required />
      <Input label={t('commun.email')} type="email" value={current?.email ?? ''} onChange={set('email')} />

      {/* Anniversaire (jour + mois) — nécessaire au module d'événements. */}
      <div>
        <label className="block text-xs text-ghost mb-1">{t('profil.anniversaire')}</label>
        <div className="flex gap-2">
          <select value={current?.naissance_jour ?? ''} onChange={set('naissance_jour')}
                  className="flex-1 bg-subtle border border-edge rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">{t('profil.jour')}</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(j => <option key={j} value={j}>{j}</option>)}
          </select>
          <select value={current?.naissance_mois ?? ''} onChange={set('naissance_mois')}
                  className="flex-[2] bg-subtle border border-edge rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">{t('profil.mois')}</option>
            {t('profil.mois_liste', { returnObjects: true }).map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
      </div>

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
  const { t } = useTranslation()

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
        <p className="text-sm font-semibold text-ink">{t('parametres.format_facture')}</p>

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
            <p className="text-xs text-ghost">{t('parametres.personnalisation_desc')}</p>
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
            <p className="text-sm font-medium text-ink mb-2">{t('parametres.logo_atelier')}</p>
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
            <label className="text-sm font-medium text-ink">{t('parametres.pied_page')}</label>
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
          <span className="text-sm text-ink">{t('parametres.assujetti_tva')}</span>
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

// P153-158 : code promo / ambassadeur — champ dédié (format libre, pas de tirets forcés)
function CodePromoSection() {
  const { t } = useTranslation()
  const codePromo = useCodePromo()
  const [code, setCode]       = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await codePromo.mutateAsync(code.trim().toUpperCase())
      setSuccess(res?.message ?? t('parametres.abonnement.active_succes'))
      setCode('')
    } catch (err) {
      setError(err?.message || t('parametres.abonnement.code_promo_invalide'))
    }
  }

  return (
    <div className="bg-card border border-edge rounded-2xl p-4 space-y-3">
      <p className="text-sm font-semibold text-ink">{t('parametres.abonnement.code_promo_titre')}</p>
      <p className="text-xs text-dim">{t('parametres.abonnement.code_promo_desc')}</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder={t('parametres.abonnement.code_promo_placeholder')}
          className="font-mono tracking-wide flex-1"
          maxLength={40}
          required
        />
        <Button type="submit" loading={codePromo.isPending} className="shrink-0">
          {t('parametres.abonnement.code_promo_btn')}
        </Button>
      </form>
      {success && <p className="text-xs text-success">{success}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
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
          onChange={e => {
            // P144 : majuscules forcées + tirets ajoutés automatiquement (format XXXX-XXXX-XXXX) —
            // l'utilisateur ne tape que les lettres/chiffres.
            const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
            setCode(raw.match(/.{1,4}/g)?.join('-') ?? '')
          }}
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
  const queryClient = useQueryClient()
  const { data: abonnement } = useAbonnement()
  const { data: plans = [] } = usePlans()
  const initierPaiement = useInitierPaiementAbonnement()
  const [recap, setRecap] = useState(null) // récap upgrade affiché avant paiement
  const [recapLoading, setRecapLoading] = useState(false)
  const [downgradeBusy, setDowngradeBusy] = useState(false)

  const prixActuel = Number(abonnement?.prix_xof ?? 0)
  const estActifPayant = abonnement?.statut === 'actif' && prixActuel > 0

  const rafraichir = () => queryClient.invalidateQueries({ queryKey: ['abonnement'] })

  // Selon le prix du plan choisi vs le plan actuel : upgrade (paiement immédiat,
  // avec crédit prorata) OU downgrade différé à l'échéance (option A, rien à payer).
  const handleUpgrade = async (niveau_cle) => {
    const plan = plans.find(p => p.cle === niveau_cle)
    const estDowngrade = estActifPayant && plan && Number(plan.prix_xof) < prixActuel

    if (estDowngrade) {
      if (!window.confirm(t('parametres.abonnement.downgrade.confirmer', {
        plan: t(`plans.${niveau_cle}`, { defaultValue: plan.label }),
        date: abonnement?.timestamp_expiration
          ? new Date(abonnement.timestamp_expiration).toLocaleDateString() : '',
      }))) return
      setDowngradeBusy(true)
      try {
        await abonnementService.programmerDowngrade(niveau_cle)
        toast.success(t('parametres.abonnement.downgrade.programme'))
        rafraichir()
      } catch (e) {
        toast.error(e?.message || t('parametres.abonnement.downgrade.erreur'))
      } finally { setDowngradeBusy(false) }
      return
    }

    // Upgrade : récapitulatif (crédit prorata, montant réel, échéance) avant paiement.
    setRecapLoading(true)
    try {
      const preview = await abonnementService.upgradePreview(niveau_cle)
      setRecap({ ...preview, niveau_cle })
    } catch {
      setRecap({ niveau_cle }) // récap indisponible → on laisse payer au prix affiché
    } finally {
      setRecapLoading(false)
    }
  }

  const annulerDowngrade = async () => {
    setDowngradeBusy(true)
    try {
      await abonnementService.annulerDowngrade()
      toast.success(t('parametres.abonnement.downgrade.annule'))
      rafraichir()
    } catch { toast.error(t('parametres.abonnement.downgrade.erreur')) }
    finally { setDowngradeBusy(false) }
  }

  const confirmerPaiement = async () => {
    const { niveau_cle } = recap
    setRecap(null)
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
          {/* PL-10 : dernière sauvegarde cloud (plans payants) */}
          {abonnement.config?.backup_cloud && (
            <div className="flex justify-between px-4 py-3 border-t border-edge">
              <span className="text-sm text-dim">{t('parametres.abonnement.sauvegarde_cloud')}</span>
              <span className="text-sm text-ink">
                {abonnement.derniere_sauvegarde_cloud
                  ? new Date(abonnement.derniere_sauvegarde_cloud).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                  : t('parametres.abonnement.sauvegarde_a_venir')}
              </span>
            </div>
          )}
        </div>
      )}

      <ActiverCodeSection />
      <CodePromoSection />

      {/* P53-55 : bandeau downgrade programmé (option A) */}
      {abonnement?.downgrade_vers_cle && (
        <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 space-y-2">
          <p className="text-sm text-ink">
            {t('parametres.abonnement.downgrade.bandeau', {
              plan: abonnement.downgrade_label
                ?? t(`plans.${abonnement.downgrade_vers_cle}`, { defaultValue: abonnement.downgrade_vers_cle }),
              date: abonnement.timestamp_expiration
                ? new Date(abonnement.timestamp_expiration).toLocaleDateString() : '',
            })}
          </p>
          <button
            onClick={annulerDowngrade}
            disabled={downgradeBusy}
            className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
          >
            {t('parametres.abonnement.downgrade.annuler')}
          </button>
        </div>
      )}

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
                isLoading={initierPaiement.isPending || recapLoading || downgradeBusy}
              />
            ))}
        </div>
      </div>

      {/* Récap upgrade (spec 16/07/2026) : crédit prorata + montant réel avant paiement */}
      <BottomSheet isOpen={!!recap} onClose={() => setRecap(null)} title={t('parametres.abonnement.recap.titre')}>
        {recap && (
          <div className="space-y-3 pb-2">
            {recap.plan_actuel && (
              <RecapLigne label={t('parametres.abonnement.recap.plan_actuel')} value={recap.plan_actuel} />
            )}
            <RecapLigne
              label={t('parametres.abonnement.recap.plan_nouveau')}
              value={recap.plan_nouveau ?? t(`plans.${recap.niveau_cle}`, { defaultValue: recap.niveau_cle })}
            />
            {recap.prix_nouveau != null && (
              <RecapLigne label={t('parametres.abonnement.recap.prix')} value={formatCurrency(recap.prix_nouveau)} />
            )}
            {recap.credit_prorata > 0 && (
              <RecapLigne
                label={t('parametres.abonnement.recap.credit', { jours: recap.jours_restants })}
                value={`− ${formatCurrency(recap.credit_prorata)}`}
                accent="text-success"
              />
            )}
            {recap.montant_a_payer != null && (
              <RecapLigne
                label={t('parametres.abonnement.recap.a_payer')}
                value={formatCurrency(recap.montant_a_payer)}
                strong
              />
            )}
            {recap.nouvelle_echeance && (
              <RecapLigne
                label={t('parametres.abonnement.recap.echeance')}
                value={new Date(recap.nouvelle_echeance).toLocaleDateString()}
              />
            )}
            <p className="text-xs text-dim">
              {recap.renouvellement
                ? t('parametres.abonnement.recap.note_renouvellement')
                : t('parametres.abonnement.recap.note_immediat')}
            </p>
            <Button className="w-full" onClick={confirmerPaiement} disabled={initierPaiement.isPending}>
              {recap.montant_a_payer > 0
                ? t('parametres.abonnement.recap.payer', { montant: formatCurrency(recap.montant_a_payer) })
                : t('parametres.abonnement.recap.confirmer')}
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}

function RecapLigne({ label, value, strong = false, accent = '' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-dim">{label}</span>
      <span className={cn('text-sm font-mono', strong ? 'font-bold text-ink text-base' : 'text-ink', accent)}>
        {value}
      </span>
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
      setApiError(err?.message ?? t('erreurs.inconnu'))
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

  // Ordre ALIGNÉ SUR LE MOBILE (spec pt 84 : « ordre Web identique à l'ordre
  // Mobile »). Le mobile groupe en trois blocs — Compte, Facturation, Application
  // — et le web les enchaîne dans le même ordre : Profil, Atelier, [Mes
  // ateliers], Sécurité, puis Facture, Abonnement, puis Préférences en dernier.
  // Avant, Préférences et Sécurité étaient intervertis, et les deux plateformes
  // divergeaient.
  const TABS = [
    { key: 'profil',       label: t('parametres.onglets.profil')       },
    { key: 'atelier',      label: t('parametres.onglets.atelier')      },
    // « Mes ateliers » (multi-ateliers) = designer uniquement.
    ...(isDesigner ? [{ key: 'ateliers', label: t('parametres.onglets.ateliers') }] : []),
    // « Type de compte » retiré du user : mutation artisan↔designer réservée à l'admin
    // (évite qu'un artisan se change en designer pour contourner l'offre). Voir feature admin.
    { key: 'securite',     label: t('parametres.onglets.securite')     },
    { key: 'facture',      label: t('parametres.onglets.facture')      },
    { key: 'abonnement',   label: t('parametres.onglets.abonnement')   },
    { key: 'preferences',  label: t('parametres.onglets.preferences')  },
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
