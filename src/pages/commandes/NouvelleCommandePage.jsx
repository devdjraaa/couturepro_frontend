import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Search, ImagePlus, X, AlertTriangle, Check } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { useVetements } from '@/hooks/useVetements'
import { useCreateCommande } from '@/hooks/useCommandes'
import { useCommunications } from '@/hooks/useParametres'
import { whatsappService } from '@/services/whatsappService'
import { AppLayout } from '@/components/layout'
import { Button, Input, Skeleton } from '@/components/ui'
import ClientAvatar from '@/components/clients/ClientAvatar'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

// ── Indicateur de progression ─────────────────────────────────────────────────
const STEP_LABELS = ['Client', 'Modèle', 'Délai', 'Prix']

function StepDots({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {STEP_LABELS.map((label, i) => (
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
        <p className="text-xs text-ghost">{`Étape ${step + 1} sur ${STEP_LABELS.length}`}</p>
        <p className="text-base font-semibold text-ink">{STEP_LABELS[step]}</p>
      </div>
    </div>
  )
}

// ── Étape 1 — Client ──────────────────────────────────────────────────────────
function StepClient({ data, setData, onNext }) {
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
            placeholder="Rechercher un client…"
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
            {search ? 'Aucun client trouvé.' : 'Aucun client dans le carnet.'}
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

// ── Étape 2 — Modèle ─────────────────────────────────────────────────────────
function StepModele({ data, setData, onNext }) {
  const { data: vetements = [], isLoading } = useVetements()
  const fileRef = useRef(null)

  const handleSelect = (vet) => {
    setData(d => ({ ...d, vetement_id: vet.id }))
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

  const canNext = !!data.vetement_id || !!data.description

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-4">
      {/* Choix du modèle */}
      <div>
        <p className="text-xs font-semibold text-ghost uppercase tracking-widest mb-2">Modèle / vêtement</p>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : vetements.length === 0 ? (
          <p className="text-sm text-ghost">
            Aucun modèle. <a href="/catalogue" className="text-primary underline">Créer un modèle →</a>
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {vetements.map(vet => {
              const selected = data.vetement_id === vet.id
              return (
                <button
                  key={vet.id}
                  type="button"
                  onClick={() => handleSelect(vet)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-3 rounded-xl border text-left transition-colors',
                    selected
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-edge bg-card text-ink hover:border-primary/20',
                  )}
                >
                  {selected && <Check size={13} className="shrink-0" />}
                  <span className="text-sm font-medium truncate">{vet.nom}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-ghost uppercase tracking-widest mb-2">
          Description / instructions
        </label>
        <textarea
          value={data.description}
          onChange={e => setData(d => ({ ...d, description: e.target.value }))}
          placeholder="Ex : Col en V, boutons dorés, longueur genou…"
          rows={3}
          className="w-full bg-card border border-edge rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Photo tissu */}
      <div>
        <p className="text-xs font-semibold text-ghost uppercase tracking-widest mb-2">Photo du tissu</p>
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
            <span className="text-xs">Ajouter une photo</span>
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
          {data.urgence ? 'Commande urgente' : 'Marquer comme urgente'}
        </span>
      </button>

      <Button
        onClick={onNext}
        disabled={!canNext}
        className="w-full"
      >
        Suivant
      </Button>
    </div>
  )
}

// ── Étape 3 — Délai ───────────────────────────────────────────────────────────
function StepDelai({ data, setData, onNext }) {
  return (
    <div className="flex flex-col flex-1 px-4 pb-4 space-y-4">
      <Input
        label="Date de livraison"
        type="date"
        value={data.date_livraison_prevue}
        onChange={e => setData(d => ({ ...d, date_livraison_prevue: e.target.value }))}
      />

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Note interne</label>
        <textarea
          value={data.note_interne}
          onChange={e => setData(d => ({ ...d, note_interne: e.target.value }))}
          placeholder="Instructions pour l'équipe, références client…"
          rows={4}
          className="w-full bg-card border border-edge rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      <div className="pt-2">
        <Button onClick={onNext} className="w-full">Suivant</Button>
      </div>
    </div>
  )
}

// ── Étape 4 — Prix & Acompte ──────────────────────────────────────────────────
const MODE_OPTIONS = [
  { value: 'especes',      label: 'Espèces'      },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'virement',     label: 'Virement'     },
]

function StepPrix({ data, setData, onSubmit, isLoading }) {
  const prix    = Number(data.prix    || 0)
  const acompte = Number(data.acompte || 0)
  const restant = Math.max(0, prix - acompte)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!prix || prix <= 0) { setError('Le prix est requis.'); return }
    if (acompte > prix)     { setError("L'acompte ne peut pas dépasser le prix."); return }
    setError('')
    onSubmit()
  }

  return (
    <div className="flex flex-col flex-1 px-4 pb-4 space-y-4">
      <Input
        label="Prix total (XOF)"
        type="number"
        min="0"
        value={data.prix}
        onChange={e => setData(d => ({ ...d, prix: e.target.value }))}
        placeholder="Ex : 35000"
        required
        error={error}
      />

      <Input
        label="Acompte reçu (XOF)"
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
          <p className="text-sm font-medium text-ink mb-2">Mode de paiement</p>
          <div className="flex gap-2">
            {MODE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setData(d => ({ ...d, mode_paiement_acompte: opt.value }))}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl text-xs font-medium border transition-colors',
                  data.mode_paiement_acompte === opt.value
                    ? 'border-primary bg-primary-50 text-primary-700'
                    : 'border-edge bg-card text-ghost',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reste à payer (live) */}
      {prix > 0 && (
        <div className={cn(
          'rounded-xl px-4 py-3 border',
          restant === 0 ? 'bg-success/8 border-success/20' : 'bg-gold-light border-gold/20'
        )}>
          <p className="text-xs text-ghost mb-0.5">Reste à payer</p>
          <p className={cn('text-lg font-bold font-mono', restant === 0 ? 'text-success' : 'text-gold-dark')}>
            {formatCurrency(restant)}
          </p>
        </div>
      )}

      <div className="pt-2">
        <Button onClick={handleSubmit} loading={isLoading} className="w-full">
          Créer la commande
        </Button>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
const INITIAL_DATA = {
  client_id:             '',
  _clientNom:            '',
  vetement_id:           '',
  prix:                  '',
  acompte:               '',
  mode_paiement_acompte: 'especes',
  date_livraison_prevue: '',
  note_interne:          '',
  description:           '',
  urgence:               false,
  photo_tissu:           null,
  _photoPreview:         null,
}

export default function NouvelleCommandePage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const createCmd = useCreateCommande()
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
    const payload = {
      client_id:             data.client_id,
      vetement_id:           data.vetement_id || undefined,
      prix:                  Number(data.prix),
      acompte:               Number(data.acompte) || 0,
      mode_paiement_acompte: Number(data.acompte) > 0 ? data.mode_paiement_acompte : undefined,
      date_livraison_prevue: data.date_livraison_prevue || undefined,
      note_interne:          data.note_interne         || undefined,
      description:           data.description          || undefined,
      urgence:               data.urgence,
      photo_tissu:           data.photo_tissu           || undefined,
    }
    const cmd = await createCmd.mutateAsync(payload)
    if (commsConfig?.whatsapp_enabled && commsConfig?.confirmation_commande && cmd?.id) {
      whatsappService.getConfirmationCommande(cmd.id)
        .then(({ lien }) => window.open(lien, '_blank', 'noopener,noreferrer'))
        .catch(() => {})
    }
    navigate(`/commandes/${cmd.id}`, { replace: true })
  }

  return (
    <AppLayout title="" noMobileHeader>
      <div className="flex flex-col h-full">
        {/* Progress dots */}
        <StepDots current={step} />

        {/* Header étape */}
        <StepHeader step={step} onBack={handleBack} />

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
