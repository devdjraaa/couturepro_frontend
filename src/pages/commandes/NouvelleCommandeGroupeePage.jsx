import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Search, Check, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useClients } from '@/hooks/useClients'
import { useVetements } from '@/hooks/useVetements'
import { useCreateCommandeGroupe } from '@/hooks/useCommandeGroupes'
import { AppLayout } from '@/components/layout'
import { Button, Input, Skeleton } from '@/components/ui'
import ClientAvatar from '@/components/clients/ClientAvatar'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const TODAY = new Date().toISOString().split('T')[0]

const STEP_KEYS = ['client', 'articles']
const MODE_VALUES = ['especes', 'mobile_money', 'virement']

const emptySousCommande = () => ({
  vetement_id: '',
  vetement_nom: '',
  quantite: 1,
  prix: '',
  acompte: '',
  mode_paiement_acompte: 'especes',
  date_livraison_prevue: '',
  description: '',
  urgence: false,
})

// ── Indicateur de progression ─────────────────────────────────────────────────
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
        <p className="text-xs text-ghost">{t('commandes.groupe_form.etape', { n: step + 1, total: STEP_KEYS.length })}</p>
        <p className="text-base font-semibold text-ink">{t(`commandes.groupe_form.step_${STEP_KEYS[step]}`)}</p>
      </div>
    </div>
  )
}

// ── Étape 1 — Client ──────────────────────────────────────────────────────────
function StepClient({ data, setData, onNext }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const { data: clients = [], isLoading } = useClients()

  const filtered = clients.filter(c =>
    `${c.prenom ?? ''} ${c.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search)
  )

  const handleSelect = (client) => {
    setData(d => ({ ...d, client_id: client.id, _clientNom: `${client.prenom ?? ''} ${client.nom}`.trim() }))
    onNext()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 pb-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('commandes.groupe_form.recherche_client')}
            className="w-full pl-9 pr-4 py-2.5 bg-subtle rounded-xl text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)
        ) : filtered.length === 0 ? (
          <p className="text-sm text-ghost text-center py-8">
            {search ? t('commandes.groupe_form.aucun_client') : t('commandes.groupe_form.carnet_vide')}
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

// ── Une sous-commande ─────────────────────────────────────────────────────────
function SousCommandeCard({ index, sc, vetements, onChange, onRemove, canRemove }) {
  const { t } = useTranslation()
  const set = (field, value) => onChange(index, field, value)

  const total = (Number(sc.quantite) || 1) * Number(sc.prix || 0)
  const acompte = Number(sc.acompte || 0)
  const surplus = acompte > total && total > 0

  return (
    <div className="bg-card border border-edge rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-ghost uppercase tracking-widest">
          {t('commandes.groupe_form.article', { n: index + 1 })}
        </p>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-error hover:bg-error/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Sélection vêtement */}
      <div className="grid grid-cols-2 gap-1.5">
        {vetements.map(vet => (
          <button
            key={vet.id}
            type="button"
            onClick={() => {
              set('vetement_id', vet.id)
              set('vetement_nom', vet.nom)
            }}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-left text-xs transition-colors',
              sc.vetement_id === vet.id
                ? 'border-primary bg-primary-50 text-primary-700'
                : 'border-edge bg-subtle text-ghost hover:border-primary/20',
            )}
          >
            {sc.vetement_id === vet.id && <Check size={11} className="shrink-0" />}
            <span className="truncate font-medium">{vet.nom}</span>
          </button>
        ))}
      </div>

      {/* Quantité + prix */}
      <div className="flex gap-2">
        <div className="w-20">
          <label className="block text-xs text-ghost mb-1">{t('commandes.groupe_form.qte')}</label>
          <input
            type="number"
            min="1"
            max="999"
            value={sc.quantite}
            onChange={e => set('quantite', Number(e.target.value) || 1)}
            className="w-full bg-subtle border border-edge rounded-lg px-2 py-1.5 text-sm text-ink text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-ghost mb-1">{t('commandes.groupe_form.prix_total')}</label>
          <input
            type="number"
            min="0"
            value={sc.prix}
            onChange={e => set('prix', e.target.value)}
            placeholder={t('commandes.groupe_form.prix_ph')}
            className="w-full bg-subtle border border-edge rounded-lg px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Date de livraison */}
      <div>
        <label className="block text-xs text-ghost mb-1">{t('commandes.groupe_form.livraison')}</label>
        <input
          type="date"
          min={TODAY}
          value={sc.date_livraison_prevue}
          onChange={e => set('date_livraison_prevue', e.target.value)}
          className="w-full bg-subtle border border-edge rounded-lg px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Acompte */}
      <div>
        <label className="block text-xs text-ghost mb-1">{t('commandes.groupe_form.acompte')}</label>
        <input
          type="number"
          min="0"
          value={sc.acompte}
          onChange={e => set('acompte', e.target.value)}
          placeholder="0"
          className="w-full bg-subtle border border-edge rounded-lg px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {acompte > 0 && (
        <div className="flex gap-2">
          {MODE_VALUES.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => set('mode_paiement_acompte', opt)}
              className={cn(
                'flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors',
                sc.mode_paiement_acompte === opt
                  ? 'border-primary bg-primary-50 text-primary-700'
                  : 'border-edge bg-card text-ghost',
              )}
            >
              {t(`commandes.groupe_form.mode.${opt}`)}
            </button>
          ))}
        </div>
      )}

      {/* Description */}
      <textarea
        value={sc.description}
        onChange={e => set('description', e.target.value)}
        placeholder={t('commandes.groupe_form.description_ph')}
        rows={2}
        className="w-full bg-subtle border border-edge rounded-lg px-2.5 py-1.5 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
      />

      {/* Urgence */}
      <button
        type="button"
        onClick={() => set('urgence', !sc.urgence)}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-medium transition-colors',
          sc.urgence
            ? 'border-warning bg-warning/5 text-warning'
            : 'border-edge bg-subtle text-ghost',
        )}
      >
        <AlertTriangle size={13} />
        {sc.urgence ? t('commandes.groupe_form.urgent') : t('commandes.groupe_form.marquer_urgent')}
      </button>

      {/* Sous-total */}
      {total > 0 && (
        <p className="text-xs text-ghost text-right">
          {t('commandes.groupe_form.sous_total')} <span className="font-mono font-semibold text-ink">{formatCurrency(total)}</span>
        </p>
      )}

      {surplus && (
        <p className="text-xs text-error">{t('commandes.groupe_form.acompte_surplus')}</p>
      )}
    </div>
  )
}

// ── Étape 2 — Sous-commandes ──────────────────────────────────────────────────
function StepSousCommandes({ data, setData, onSubmit, isLoading }) {
  const { t } = useTranslation()
  const { data: vetements = [], isLoading: loadingVetements } = useVetements()
  const [error, setError] = useState('')

  const updateSousCommande = (index, field, value) => {
    setData(d => ({
      ...d,
      sous_commandes: d.sous_commandes.map((sc, i) => i === index ? { ...sc, [field]: value } : sc),
    }))
  }

  const addSousCommande = () => {
    setData(d => ({ ...d, sous_commandes: [...d.sous_commandes, emptySousCommande()] }))
  }

  const removeSousCommande = (index) => {
    setData(d => ({ ...d, sous_commandes: d.sous_commandes.filter((_, i) => i !== index) }))
  }

  const totalGeneral  = data.sous_commandes.reduce((s, sc) => s + (Number(sc.quantite) || 1) * Number(sc.prix || 0), 0)
  const acompteTotal  = data.sous_commandes.reduce((s, sc) => s + Number(sc.acompte || 0), 0)

  const handleSubmit = () => {
    const valides = data.sous_commandes.filter(sc => sc.vetement_id && Number(sc.prix) > 0)
    if (valides.length < 2) {
      setError(t('commandes.groupe_form.err_min'))
      return
    }
    setError('')
    onSubmit()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-4">
      {/* Client sélectionné */}
      <div className="flex items-center gap-2 bg-primary-50 border border-primary/20 rounded-xl px-3 py-2">
        <Check size={14} className="text-primary shrink-0" />
        <p className="text-sm text-ink truncate">
          {t('commandes.groupe_form.client_label')} <span className="font-semibold">{data._clientNom}</span>
        </p>
      </div>

      {loadingVetements ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : (
        <div className="space-y-3">
          {data.sous_commandes.map((sc, idx) => (
            <SousCommandeCard
              key={idx}
              index={idx}
              sc={sc}
              vetements={vetements}
              onChange={updateSousCommande}
              onRemove={removeSousCommande}
              canRemove={data.sous_commandes.length > 2}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addSousCommande}
        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-dashed border-edge text-sm font-medium text-primary hover:border-primary/40 transition-colors"
      >
        <Plus size={14} /> {t('commandes.groupe_form.ajouter_article')}
      </button>

      {/* Note groupe */}
      <div>
        <label className="block text-xs font-semibold text-ghost uppercase tracking-widest mb-2">
          {t('commandes.groupe_form.note')}
        </label>
        <textarea
          value={data.note}
          onChange={e => setData(d => ({ ...d, note: e.target.value }))}
          placeholder={t('commandes.groupe_form.note_ph')}
          rows={2}
          className="w-full bg-card border border-edge rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Récapitulatif */}
      {totalGeneral > 0 && (
        <div className="bg-card border border-edge rounded-2xl px-4 py-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-ghost">{t('commandes.groupe_form.total')}</span>
            <span className="font-bold font-mono text-ink">{formatCurrency(totalGeneral)}</span>
          </div>
          {acompteTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-ghost">{t('commandes.groupe_form.acomptes')}</span>
              <span className="font-semibold font-mono text-success">{formatCurrency(acompteTotal)}</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-error px-1">{error}</p>}

      <Button onClick={handleSubmit} loading={isLoading} className="w-full">
        {t('commandes.groupe_form.creer')}
      </Button>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
const INITIAL_DATA = {
  client_id:      '',
  _clientNom:     '',
  note:           '',
  sous_commandes: [emptySousCommande(), emptySousCommande()],
}

export default function NouvelleCommandeGroupeePage() {
  const navigate  = useNavigate()
  const createGroupe = useCreateCommandeGroupe()

  const [step, setStep] = useState(0)
  const [data, setData] = useState(INITIAL_DATA)

  const handleBack = () => {
    if (step === 0) navigate(-1)
    else setStep(s => s - 1)
  }

  const handleNext = () => setStep(s => s + 1)

  const handleSubmit = async () => {
    const sousCommandes = data.sous_commandes
      .filter(sc => sc.vetement_id && Number(sc.prix) > 0)
      .map(sc => ({
        vetement_id:           sc.vetement_id,
        quantite:              Number(sc.quantite) || 1,
        prix:                  Number(sc.prix),
        acompte:               Number(sc.acompte) || 0,
        mode_paiement_acompte: Number(sc.acompte) > 0 ? sc.mode_paiement_acompte : undefined,
        date_livraison_prevue: sc.date_livraison_prevue || undefined,
        description:           sc.description || undefined,
        urgence:               sc.urgence,
      }))

    const groupe = await createGroupe.mutateAsync({
      client_id:      data.client_id,
      note:           data.note || undefined,
      sous_commandes: sousCommandes,
    })

    navigate(`/commandes/groupes/${groupe.id}`, { replace: true })
  }

  return (
    <AppLayout title="" noMobileHeader noAnimation>
      <div className="flex flex-col h-full">
        <StepDots current={step} />
        <StepHeader step={step} onBack={handleBack} />

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden mt-2">
          {step === 0 && (
            <StepClient data={data} setData={setData} onNext={handleNext} />
          )}
          {step === 1 && (
            <StepSousCommandes
              data={data}
              setData={setData}
              onSubmit={handleSubmit}
              isLoading={createGroupe.isPending}
            />
          )}
        </div>
      </div>
    </AppLayout>
  )
}
