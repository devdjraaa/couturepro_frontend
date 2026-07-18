import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Search, ImagePlus, X, AlertTriangle, Check, Plus, Trash2, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useClients } from '@/hooks/useClients'
import { useMesAteliers } from '@/hooks/useMesAteliers'
import { useAuth } from '@/contexts'
import { useVetements } from '@/hooks/useVetements'
import { useCreateCommande } from '@/hooks/useCommandes'
import { useCreateCommandeItems } from '@/hooks/useCommandeItems'
import { useCommunications } from '@/hooks/useParametres'
import { whatsappService } from '@/services/whatsappService'
import { AppLayout } from '@/components/layout'
import { Button, Input, Skeleton } from '@/components/ui'
import ClientAvatar from '@/components/clients/ClientAvatar'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const TODAY = new Date().toISOString().split('T')[0]

// ── Indicateur de progression ─────────────────────────────────────────────────
const STEP_KEYS = ['client', 'modele', 'delai', 'prix']
const MODE_VALUES = ['especes', 'mobile_money', 'virement']

function StepDots({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {STEP_KEYS.map((label, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className={cn(
            'w-2 h-2 rounded-full transition-all duration-200',
            i < current  ? 'bg-primary w-2 h-2' :
            i === current ? 'bg-primary w-3 h-3 scale-125' :
            'bg-edge',
          )} />
        </div>
      ))}
    </div>
  )
}

function StepHeader({ step, onBack }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-2">
      <button
        type="button"
        onClick={onBack}
        className="w-9 h-9 rounded-xl bg-subtle flex items-center justify-center text-ghost hover:text-ink transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="flex-1">
        <p className="text-xs text-ghost">{t('commandes.creation.etape', { n: step + 1, total: STEP_KEYS.length })}</p>
        <p className="text-base font-semibold text-ink">{t(`commandes.creation.step_${STEP_KEYS[step]}`)}</p>
      </div>
    </div>
  )
}

// ── Étape 1 — Client ──────────────────────────────────────────────────────────
function StepClient({ data, setData, onNext }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const { atelier } = useAuth()
  // P72-73 : commande cross-atelier sans ressaisie — on peut choisir un client d'un autre
  // de mes ateliers (la commande sera rattachée à l'atelier du client).
  const { data: mesAteliers = [] } = useMesAteliers()
  const multiAteliers = mesAteliers.length > 1
  const [scope, setScope] = useState('atelier') // 'atelier' | 'tous'
  const ateliersById = mesAteliers.reduce((acc, a) => (acc[a.id] = a.nom, acc), {})
  const { data: clients = [], isLoading } = useClients(
    multiAteliers && scope === 'tous' ? { scope: 'tous' } : {},
  )

  const filtered = clients.filter(c =>
    `${c.prenom ?? ''} ${c.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search)
  )

  const badgeFor = (c) =>
    scope === 'tous' && c.atelier_id && c.atelier_id !== atelier?.id
      ? (ateliersById[c.atelier_id] ?? t('clients.autre_atelier'))
      : null

  const handleSelect = (client) => {
    setData(d => ({ ...d, client_id: client.id, _clientNom: `${client.prenom ?? ''} ${client.nom}`.trim() }))
    onNext()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 pb-3 space-y-2.5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('commandes.creation.recherche_client')}
            className="w-full pl-9 pr-4 py-2.5 bg-subtle rounded-xl text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
        </div>
        {/* P72-73 : portée cross-ateliers (comptes multi-ateliers) */}
        {multiAteliers && (
          <div className="flex gap-1.5">
            {[['atelier', t('clients.scope_atelier')], ['tous', t('clients.scope_tous')]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setScope(key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  scope === key ? 'bg-primary text-inverse' : 'bg-subtle text-ghost hover:text-ink',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)
        ) : filtered.length === 0 ? (
          <p className="text-sm text-ghost text-center py-8">
            {search ? t('commandes.creation.aucun_client') : t('commandes.creation.carnet_vide')}
          </p>
        ) : (
          filtered.map(client => {
            const nom = `${client.prenom ?? ''} ${client.nom}`.trim()
            const selected = data.client_id === client.id
            return (
              <button
                key={client.id}
                type="button"
                onClick={() => handleSelect(client)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left',
                  selected
                    ? 'border-primary/40 bg-primary-50'
                    : 'border-edge bg-card hover:border-primary/20',
                )}
              >
                <ClientAvatar client={client} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{nom}</p>
                  <p className="text-xs text-ghost">{client.telephone}</p>
                  {badgeFor(client) && (
                    <span className="inline-block mt-0.5 text-[10px] font-medium text-primary bg-primary-50 rounded px-1.5 py-0.5">
                      {badgeFor(client)}
                    </span>
                  )}
                </div>
                {selected && <Check size={16} className="text-primary shrink-0" />}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Étape 2 — Modèle (multi-articles) ────────────────────────────────────────
function StepModele({ data, setData, onNext }) {
  const { t } = useTranslation()
  const { data: vetements = [], isLoading } = useVetements()
  const fileRef = useRef(null)

  const addItem = () => {
    setData(d => ({
      ...d,
      items: [...d.items, { vetement_id: '', vetement_nom: '', quantite: 1, prix_unitaire: '' }],
    }))
  }

  const removeItem = (idx) => {
    setData(d => ({ ...d, items: d.items.filter((_, i) => i !== idx) }))
  }

  const updateItem = (idx, field, value) => {
    setData(d => {
      const items = d.items.map((it, i) => {
        if (i !== idx) return it
        const updated = { ...it, [field]: value }
        if (field === 'vetement_id') {
          updated.vetement_nom = vetements.find(v => v.id === value)?.nom ?? ''
        }
        return updated
      })
      return { ...d, items }
    })
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setData(d => ({ ...d, photo_tissu: file, _photoPreview: URL.createObjectURL(file) }))
  }

  const clearPhoto = () => {
    setData(d => ({ ...d, photo_tissu: null, _photoPreview: null }))
    if (fileRef.current) fileRef.current.value = ''
  }

  const canNext = data.items.some(it => it.vetement_id || it.vetement_nom) || !!data.description

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-4">

      {/* Articles (#15, #18-20) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-ghost uppercase tracking-widest">{t('commandes.creation.articles')}</p>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus size={13} /> {t('commun.ajouter')}
          </button>
        </div>

        {isLoading ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : (
          <div className="space-y-3">
            {data.items.map((item, idx) => (
              <div key={idx} className="bg-card border border-edge rounded-xl p-3 space-y-2">
                {/* Sélection vêtement */}
                <div className="grid grid-cols-2 gap-1.5">
                  {vetements.map(vet => (
                    <button
                      key={vet.id}
                      type="button"
                      onClick={() => updateItem(idx, 'vetement_id', vet.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-left text-xs transition-colors',
                        item.vetement_id === vet.id
                          ? 'border-primary bg-primary-50 text-primary-700'
                          : 'border-edge bg-subtle text-ghost hover:border-primary/20',
                      )}
                    >
                      {item.vetement_id === vet.id && <Check size={11} className="shrink-0" />}
                      <span className="truncate font-medium">{vet.nom}</span>
                    </button>
                  ))}
                </div>

                {/* Quantité + prix unitaire */}
                <div className="flex gap-2 items-end">
                  <div className="w-20">
                    <label className="block text-xs text-ghost mb-1">{t('commandes.creation.qte')}</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="999"
                      value={item.quantite}
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        const v = e.target.value
                        // Autorise le champ vide pendant la saisie (SUG-18 : pouvoir effacer)
                        if (v === '') { updateItem(idx, 'quantite', ''); return }
                        updateItem(idx, 'quantite', Math.min(999, Math.max(1, Math.floor(Number(v)) || 1)))
                      }}
                      onBlur={e => { if (e.target.value === '' || Number(e.target.value) < 1) updateItem(idx, 'quantite', 1) }}
                      className="w-full bg-subtle border border-edge rounded-lg px-2 py-1.5 text-sm text-ink text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-ghost mb-1">{t('commandes.creation.prix_unitaire')}</label>
                    <input
                      type="number"
                      min="0"
                      value={item.prix_unitaire}
                      onChange={e => updateItem(idx, 'prix_unitaire', e.target.value)}
                      placeholder={t('commandes.creation.prix_unitaire_ph')}
                      className="w-full bg-subtle border border-edge rounded-lg px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  {data.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="mb-0.5 w-8 h-8 flex items-center justify-center rounded-lg text-error hover:bg-error/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Sous-total article */}
                {item.prix_unitaire > 0 && (
                  <p className="text-xs text-ghost text-right">
                    = {formatCurrency(item.quantite * Number(item.prix_unitaire))}
                  </p>
                )}
              </div>
            ))}

            {/* Total articles */}
            {data.items.some(it => it.prix_unitaire > 0) && (
              <div className="flex justify-between items-center px-1 pt-1">
                <span className="text-xs text-ghost">{t('commandes.creation.total_articles')}</span>
                <span className="text-sm font-bold text-ink font-mono">
                  {formatCurrency(data.items.reduce((s, it) => s + (it.quantite * Number(it.prix_unitaire || 0)), 0))}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-ghost uppercase tracking-widest mb-2">
          {t('commandes.creation.description')}
        </label>
        <textarea
          value={data.description}
          onChange={e => setData(d => ({ ...d, description: e.target.value }))}
          placeholder={t('commandes.creation.description_ph')}
          rows={3}
          className="w-full bg-card border border-edge rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Photo tissu */}
      <div>
        <p className="text-xs font-semibold text-ghost uppercase tracking-widest mb-2">{t('commandes.creation.photo_titre')}</p>
        {data._photoPreview ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-edge">
            <img src={data._photoPreview} alt="tissu" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-inverse hover:bg-black/70 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full py-5 rounded-xl border-2 border-dashed border-edge flex flex-col items-center gap-1.5 text-ghost hover:border-primary hover:text-primary transition-colors"
          >
            <ImagePlus size={20} />
            <span className="text-xs">{t('commandes.creation.ajouter_photo')}</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {/* Urgence */}
      <button
        type="button"
        onClick={() => setData(d => ({ ...d, urgence: !d.urgence }))}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors',
          data.urgence
            ? 'border-warning bg-warning/5 text-warning'
            : 'border-edge bg-card text-ghost',
        )}
      >
        <AlertTriangle size={15} />
        <span className="text-sm font-medium">
          {data.urgence ? t('commandes.creation.urgente') : t('commandes.creation.marquer_urgente')}
        </span>
      </button>

      <Button onClick={onNext} disabled={!canNext} className="w-full">{t('commun.suivant')}</Button>
    </div>
  )
}

// ── Étape 3 — Délai ───────────────────────────────────────────────────────────
function StepDelai({ data, setData, onNext }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col flex-1 px-4 pb-4 space-y-4">
      {/* #16-17 — min=TODAY bloque les dates passées */}
      <Input
        label={t('commandes.creation.date_livraison')}
        type="date"
        min={TODAY}
        value={data.date_livraison_prevue}
        onChange={e => setData(d => ({ ...d, date_livraison_prevue: e.target.value }))}
      />

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">{t('commandes.creation.note_interne')}</label>
        <textarea
          value={data.note_interne}
          onChange={e => setData(d => ({ ...d, note_interne: e.target.value }))}
          placeholder={t('commandes.creation.note_interne_ph')}
          rows={4}
          className="w-full bg-card border border-edge rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      <div className="pt-2">
        <Button onClick={onNext} className="w-full">{t('commun.suivant')}</Button>
      </div>
    </div>
  )
}

// ── Étape 4 — Prix & Acompte ──────────────────────────────────────────────────
function StepPrix({ data, setData, onSubmit, isLoading }) {
  const { t } = useTranslation()
  const itemsTotal = data.items.reduce((s, it) => s + (Number(it.quantite) * Number(it.prix_unitaire || 0)), 0)
  const prix       = Number(data.prix || 0) || itemsTotal
  const acompte    = Number(data.acompte || 0)
  const restant    = Math.max(0, prix - acompte)
  const surplus    = acompte > prix && prix > 0
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!prix || prix <= 0) { setError(t('commandes.creation.err_prix')); return }
    // #12-14 : acompte > prix autorisé si motif renseigné
    if (surplus && !data.motif_surplus_acompte?.trim()) {
      setError(t('commandes.creation.err_surplus'))
      return
    }
    setError('')
    onSubmit()
  }

  return (
    <div className="flex flex-col flex-1 px-4 pb-4 space-y-4">
      <Input
        label={t('commandes.creation.prix_total')}
        type="number"
        min="0"
        value={data.prix}
        onChange={e => setData(d => ({ ...d, prix: e.target.value }))}
        placeholder={t('commandes.creation.prix_total_ph')}
        required
        error={error}
      />

      <Input
        label={t('commandes.creation.acompte')}
        type="number"
        min="0"
        max={prix || undefined}
        value={data.acompte}
        onChange={e => setData(d => ({ ...d, acompte: e.target.value }))}
        placeholder="0"
      />

      {/* Mode de paiement — visible seulement si acompte > 0 */}
      {acompte > 0 && (
        <div>
          <p className="text-sm font-medium text-ink mb-2">{t('commandes.creation.mode_titre')}</p>
          <div className="flex gap-2">
            {MODE_VALUES.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setData(d => ({ ...d, mode_paiement_acompte: opt }))}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl text-xs font-medium border transition-colors',
                  data.mode_paiement_acompte === opt
                    ? 'border-primary bg-primary-50 text-primary-700'
                    : 'border-edge bg-card text-ghost',
                )}
              >
                {t(`commandes.creation.mode.${opt}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Total calculé depuis les articles (si renseignés) */}
      {itemsTotal > 0 && !data.prix && (
        <div className="flex items-center gap-2 bg-subtle rounded-xl px-4 py-2.5 text-sm text-ghost">
          <Info size={14} />
          {t('commandes.creation.total_calcule')} <span className="font-mono font-semibold text-ink ml-1">{formatCurrency(itemsTotal)}</span>
        </div>
      )}

      {/* Reste à payer (live) */}
      {prix > 0 && (
        <div className={cn(
          'rounded-xl px-4 py-3 border',
          surplus         ? 'bg-error/8 border-error/20'   :
          restant === 0   ? 'bg-success/8 border-success/20' :
                            'bg-gold-light border-gold/20'
        )}>
          <p className="text-xs text-ghost mb-0.5">
            {surplus ? t('commandes.creation.acompte_surplus_label') : t('commandes.creation.reste')}
          </p>
          <p className={cn(
            'text-lg font-bold font-mono',
            surplus       ? 'text-error'   :
            restant === 0 ? 'text-success' : 'text-gold-dark',
          )}>
            {surplus ? `+ ${formatCurrency(acompte - prix)}` : formatCurrency(restant)}
          </p>
        </div>
      )}

      {/* #12-14 — Motif obligatoire si acompte > prix */}
      {surplus && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-error">
            {t('commandes.creation.motif_surplus')} <span className="text-error">*</span>
          </label>
          <textarea
            value={data.motif_surplus_acompte}
            onChange={e => setData(d => ({ ...d, motif_surplus_acompte: e.target.value }))}
            placeholder={t('commandes.creation.motif_surplus_ph')}
            rows={2}
            className="w-full bg-card border border-error/40 rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-error/30 resize-none"
          />
        </div>
      )}

      {error && <p className="text-xs text-error px-1">{error}</p>}

      <div className="pt-2">
        <Button onClick={handleSubmit} loading={isLoading} className="w-full">
          {t('commandes.creation.creer')}
        </Button>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
const INITIAL_DATA = {
  client_id:              '',
  _clientNom:             '',
  items:                  [{ vetement_id: '', vetement_nom: '', quantite: 1, prix_unitaire: '' }],
  prix:                   '',
  acompte:                '',
  motif_surplus_acompte:  '',
  mode_paiement_acompte:  'especes',
  date_livraison_prevue:  '',
  note_interne:           '',
  description:            '',
  urgence:                false,
  photo_tissu:            null,
  _photoPreview:          null,
}

export default function NouvelleCommandePage() {
  const navigate      = useNavigate()
  const location      = useLocation()
  const { t }         = useTranslation()
  const createCmd     = useCreateCommande()
  const { data: commsConfig } = useCommunications()

  const startStep = location.state?.clientId ? 1 : 0
  const [step, setStep] = useState(startStep)
  const [data, setData] = useState({
    ...INITIAL_DATA,
    client_id:  location.state?.clientId ?? '',
    _clientNom: location.state?.clientNom ?? '',
  })

  const handleBack = () => {
    if (step === 0) navigate(-1)
    else setStep(s => s - 1)
  }

  const handleNext = () => setStep(s => s + 1)

  const handleSubmit = async () => {
    // Calcul prix depuis items si pas saisi manuellement
    const itemsTotal = data.items.reduce((s, it) => s + (Number(it.quantite) * Number(it.prix_unitaire || 0)), 0)
    const prixFinal  = Number(data.prix) || itemsTotal

    // Article principal (premier item avec vetement_id)
    const premierItem = data.items.find(it => it.vetement_id)

    const payload = {
      client_id:             data.client_id,
      vetement_id:           premierItem?.vetement_id || undefined,
      quantite:              premierItem?.quantite    || 1,
      prix:                  prixFinal,
      acompte:               Number(data.acompte) || 0,
      motif_surplus_acompte: data.motif_surplus_acompte || undefined,
      mode_paiement_acompte: Number(data.acompte) > 0 ? data.mode_paiement_acompte : undefined,
      date_livraison_prevue: data.date_livraison_prevue || undefined,
      note_interne:          data.note_interne          || undefined,
      description:           data.description           || undefined,
      urgence:               data.urgence,
      photo_tissu:           data.photo_tissu            || undefined,
    }

    const cmd = await createCmd.mutateAsync(payload)

    // Enregistrer les items multiples si > 1 article renseigné avec prix
    const itemsValides = data.items.filter(it => (it.vetement_id || it.vetement_nom) && it.prix_unitaire > 0)
    if (itemsValides.length > 1 && cmd?.id) {
      try {
        const { commandeItemService } = await import('@/services/commandeItemService')
        await commandeItemService.bulkCreate(cmd.id, itemsValides)
      } catch {}
    }

    if (commsConfig?.whatsapp_enabled && commsConfig?.confirmation_commande && cmd?.id) {
      whatsappService.getConfirmationCommande(cmd.id)
        .then(({ lien }) => window.open(lien, '_blank', 'noopener,noreferrer'))
        .catch(() => {})
    }
    navigate(`/commandes/${cmd.id}`, { replace: true })
  }

  return (
    <AppLayout title="" noMobileHeader noAnimation>
      <div className="flex flex-col h-full">
        {/* Progress dots */}
        <StepDots current={step} />

        {/* Header étape */}
        <StepHeader step={step} onBack={handleBack} />

        {/* Pt 63 : le client sélectionné reste visible pendant toute la création. */}
        {step > 0 && data._clientNom && (
          <p className="mx-4 mt-1 text-[12.5px] text-dim">
            {t('commandes.creation.commande_de')} <span className="font-semibold text-primary">{data._clientNom}</span>
          </p>
        )}

        {/* Contenu étape */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden mt-2">
          {step === 0 && (
            <StepClient data={data} setData={setData} onNext={handleNext} />
          )}
          {step === 1 && (
            <StepModele data={data} setData={setData} onNext={handleNext} />
          )}
          {step === 2 && (
            <StepDelai data={data} setData={setData} onNext={handleNext} />
          )}
          {step === 3 && (
            <StepPrix
              data={data}
              setData={setData}
              onSubmit={handleSubmit}
              isLoading={createCmd.isPending}
            />
          )}
        </div>
      </div>
    </AppLayout>
  )
}
