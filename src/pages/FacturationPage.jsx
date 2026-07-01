import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Plus, X, ChevronDown, ChevronUp, Upload, Send,
  QrCode, Trash2, Check, AlertCircle, Clock, Ban,
  MessageCircle, Download, ShieldCheck, Printer,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'
import { partagerFactureHabillee } from '@/utils/imprimerFactureHabillee'
import { exportFactureDocPdf, shareOrDownloadPdf } from '@/utils/exportFacturePdf'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/contexts'
import { factureService } from '@/services/factureService'
import { useFactureSettings } from '@/hooks/useParametres'
import { FeatureGate } from '@/components/abonnement'
import { usePlanFeature } from '@/hooks/usePlanFeature'
import { cn } from '@/utils/cn'

const MODES_PAIEMENT = ['wave', 'om', 'especes', 'virement', 'autre']
const TYPES_DOC      = ['devis', 'facture', 'recu']
const GABARITS       = ['standard', 'personnalise']

const STATUTS = {
  non_payee: { color: 'text-warning',  bg: 'bg-warning/10',  icon: Clock       },
  acompte:   { color: 'text-primary',  bg: 'bg-primary/10',  icon: AlertCircle },
  soldee:    { color: 'text-success',  bg: 'bg-success/10',  icon: Check       },
  annulee:   { color: 'text-danger',   bg: 'bg-danger/10',   icon: Ban         },
}

const calcTotal = (lignes) => lignes.reduce((sum, l) => sum + (Number(l.quantite) || 0) * (Number(l.prix_unitaire) || 0), 0)
const fmt = (v) => new Intl.NumberFormat('fr-FR').format(Number(v) || 0)

function StatutBadge({ statut }) {
  const { t } = useTranslation()
  const key = STATUTS[statut] ? statut : 'non_payee'
  const s = STATUTS[key]
  const Icon = s.icon
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full', s.bg, s.color)}>
      <Icon size={11} /> {t(`facturation.statuts.${key}`)}
    </span>
  )
}

function LigneRow({ ligne, onChange, onRemove, index }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-2 items-start">
      <input
        value={ligne.description}
        onChange={(e) => onChange(index, 'description', e.target.value)}
        placeholder={t('facturation.ligne.description')}
        className="flex-1 rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <input
        type="number" min="1"
        value={ligne.quantite}
        onChange={(e) => onChange(index, 'quantite', e.target.value)}
        placeholder={t('facturation.ligne.qte')}
        className="w-16 rounded-lg border border-edge bg-app px-2 py-2 text-sm text-ink text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <input
        type="number" min="0"
        value={ligne.prix_unitaire}
        onChange={(e) => onChange(index, 'prix_unitaire', e.target.value)}
        placeholder={t('facturation.ligne.prix')}
        className="w-28 rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <button onClick={() => onRemove(index)} className="mt-2 text-ghost hover:text-danger transition">
        <X size={15} />
      </button>
    </div>
  )
}

const EMPTY_FORM = {
  type: 'facture',
  client_nom: '',
  client_telephone: '',
  date_echeance: '',
  lignes: [{ description: '', quantite: 1, prix_unitaire: '' }],
  mode_paiement: 'wave',
  gabarit: 'standard',
  acompte: '',
  notes: '',
}

function FormulaireModal({ onClose, onCreated }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const updateLigne = (i, k, v) => {
    const lignes = [...form.lignes]
    lignes[i] = { ...lignes[i], [k]: v }
    setForm((f) => ({ ...f, lignes }))
  }

  const addLigne = () => setForm((f) => ({
    ...f,
    lignes: [...f.lignes, { description: '', quantite: 1, prix_unitaire: '' }],
  }))

  const removeLigne = (i) => setForm((f) => ({
    ...f,
    lignes: f.lignes.filter((_, idx) => idx !== i),
  }))

  const total = calcTotal(form.lignes)
  const restant = total - (Number(form.acompte) || 0)

  const submit = async () => {
    if (!form.client_nom.trim()) { setErr(t('facturation.modal.err_client')); return }
    if (form.lignes.length === 0) { setErr(t('facturation.modal.err_ligne')); return }
    if (form.lignes.some((l) => !l.description.trim())) { setErr(t('facturation.modal.err_desc')); return }
    setSaving(true); setErr('')
    try {
      const created = await factureService.create({
        ...form,
        lignes: form.lignes.map((l) => ({
          description: l.description,
          quantite: Number(l.quantite) || 1,
          prix_unitaire: Number(l.prix_unitaire) || 0,
        })),
        acompte: Number(form.acompte) || 0,
      })
      onCreated(created)
      onClose()
    } catch {
      setErr(t('facturation.modal.err_creation'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-[#0D0D0D]/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-card border border-edge rounded-2xl shadow-xl w-full max-w-xl relative">
        <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
          <h2 className="font-display font-bold text-lg text-ink">{t('facturation.modal.titre')}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-ghost hover:text-ink transition">
            <X size={17} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type de document */}
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">{t('facturation.modal.type')}</label>
            <div className="flex gap-2">
              {TYPES_DOC.map((ty) => (
                <button
                  key={ty}
                  onClick={() => set('type', ty)}
                  className={cn(
                    'flex-1 py-2 rounded-xl border text-sm font-semibold transition',
                    form.type === ty ? 'border-primary bg-primary/5 text-primary' : 'border-edge text-dim hover:border-primary hover:text-ink',
                  )}
                >
                  {t(`facturation.types.${ty}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Client */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dim mb-1">{t('facturation.modal.client_nom')}</label>
              <input value={form.client_nom} onChange={(e) => set('client_nom', e.target.value)}
                     placeholder={t('facturation.modal.client_nom_ph')}
                     className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dim mb-1">{t('facturation.modal.telephone')}</label>
              <input value={form.client_telephone} onChange={(e) => set('client_telephone', e.target.value)}
                     placeholder={t('facturation.modal.telephone_ph')}
                     className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dim mb-1">{t('facturation.modal.date_echeance')}</label>
              <input type="date" value={form.date_echeance} onChange={(e) => set('date_echeance', e.target.value)}
                     className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dim mb-1">{t('facturation.modal.mode_paiement')}</label>
              <select value={form.mode_paiement} onChange={(e) => set('mode_paiement', e.target.value)}
                      className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30">
                {MODES_PAIEMENT.map((m) => <option key={m} value={m}>{t(`facturation.modes.${m}`)}</option>)}
              </select>
            </div>
          </div>

          {/* Lignes */}
          <div>
            <label className="block text-xs font-medium text-dim mb-2">{t('facturation.modal.lignes')}</label>
            <div className="space-y-2">
              {form.lignes.map((l, i) => (
                <LigneRow key={i} ligne={l} index={i} onChange={updateLigne} onRemove={removeLigne} />
              ))}
            </div>
            <button onClick={addLigne} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <Plus size={13} /> {t('facturation.modal.ajouter_ligne')}
            </button>
          </div>

          {/* Totaux */}
          <div className="bg-subtle border border-edge rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-dim">{t('facturation.modal.sous_total')}</span>
              <span className="font-semibold text-ink">{fmt(total)} {t('facturation.fcfa')}</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-dim">{t('facturation.modal.acompte')}</label>
              <input
                type="number" min="0"
                value={form.acompte}
                onChange={(e) => set('acompte', e.target.value)}
                placeholder="0"
                className="w-32 rounded-lg border border-edge bg-app px-3 py-1.5 text-sm text-ink text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex justify-between text-sm border-t border-edge pt-1.5 mt-1">
              <span className="font-semibold text-ink">{t('facturation.modal.restant')}</span>
              <span className="font-bold font-display text-ink">{fmt(restant < 0 ? 0 : restant)} {t('facturation.fcfa')}</span>
            </div>
          </div>

          {/* Gabarit */}
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">{t('facturation.modal.gabarit')}</label>
            <div className="grid grid-cols-2 gap-2">
              {GABARITS.map((g) => (
                <button
                  key={g}
                  onClick={() => set('gabarit', g)}
                  className={cn(
                    'text-left px-3 py-2.5 rounded-xl border transition',
                    form.gabarit === g ? 'border-primary bg-primary/5' : 'border-edge hover:border-primary',
                  )}
                >
                  <p className={cn('text-sm font-semibold', form.gabarit === g ? 'text-primary' : 'text-ink')}>{t(`facturation.gabarits.${g}_label`)}</p>
                  <p className="text-[11px] text-ghost">{t(`facturation.gabarits.${g}_desc`)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-dim mb-1">{t('facturation.modal.notes')}</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2}
                      placeholder={t('facturation.modal.notes_ph')}
                      className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          {err && <p className="text-xs text-danger font-medium">{err}</p>}
        </div>

        <div className="px-5 pb-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-edge text-sm font-semibold text-dim hover:text-ink transition">
            {t('commun.annuler')}
          </button>
          <button onClick={submit} disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-600 transition disabled:opacity-60">
            {saving ? t('facturation.modal.creation') : t('facturation.modal.creer')}
          </button>
        </div>
      </div>
    </div>
  )
}

function DocCard({ doc, onStatutChange, onDgiUploaded, onDelete }) {
  const { t } = useTranslation()
  const { atelier } = useAuth()
  const [open, setOpen] = useState(false)
  const [updatingStatut, setUpdatingStatut] = useState(false)
  const [uploadingDgi, setUploadingDgi] = useState(false)
  const [normalisant, setNormalisant] = useState(false)
  const [normErr, setNormErr] = useState('')
  const [acompteInput, setAcompteInput] = useState(String(doc.acompte || 0))
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [habilling, setHabilling] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const { available: peutNormaliser } = usePlanFeature('facturation_normalisee')
  const { data: factureSettings } = useFactureSettings()

  const habiller = async () => {
    if (habilling) return
    setHabilling(true)
    try { await partagerFactureHabillee(doc, atelier) }
    catch { alert(t('facturation.doc.habillage_erreur')) }
    finally { setHabilling(false) }
  }

  // PDF « simple » (devis/facture/reçu non normalisé) : génération + partage/téléchargement.
  const telechargerPdf = async () => {
    if (pdfBusy) return
    setPdfBusy(true)
    try {
      const { pdf, filename } = await exportFactureDocPdf({ facture: doc, atelier, factureSettings })
      await shareOrDownloadPdf(pdf, filename, { title: filename })
    } catch { alert(t('facturation.doc.pdf_erreur')) }
    finally { setPdfBusy(false) }
  }

  // Le qrCode renvoyé par e-MECeF est un CONTENU (pas une URL) → on génère l'image QR.
  useEffect(() => {
    let on = true
    if (doc.qr_code_url) {
      QRCode.toDataURL(doc.qr_code_url, { width: 220, margin: 1 })
        .then(url => { if (on) setQrDataUrl(url) })
        .catch(() => { if (on) setQrDataUrl(null) })
    } else { setQrDataUrl(null) }
    return () => { on = false }
  }, [doc.qr_code_url])

  const total = calcTotal(doc.lignes || [])
  const restant = total - (Number(doc.acompte) || 0)

  const changeStatut = async (statut) => {
    setUpdatingStatut(true)
    try {
      const updated = await factureService.updateStatut(doc.id, statut, statut === 'acompte' ? Number(acompteInput) || 0 : null)
      onStatutChange(updated)
    } catch { /* silencieux */ } finally { setUpdatingStatut(false) }
  }

  const uploadDgi = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingDgi(true)
    try {
      const updated = await factureService.uploadDgi(doc.id, file)
      onDgiUploaded(updated)
    } catch { /* silencieux */ } finally { setUploadingDgi(false) }
  }

  const normaliser = async () => {
    setNormalisant(true); setNormErr('')
    try {
      const updated = await factureService.normaliser(doc.id)
      onDgiUploaded(updated)
    } catch (e) {
      setNormErr(e?.response?.data?.message || t('facturation.doc.normaliser_err'))
    } finally { setNormalisant(false) }
  }

  const sendWhatsApp = () => {
    const tel = (doc.client_telephone || '').replace(/\D/g, '')
    const msg = encodeURIComponent(
      t('facturation.doc.wa_message', {
        client: doc.client_nom,
        type: t(`facturation.types.${doc.type}`),
        numero: doc.numero,
        total: fmt(total),
        restant: fmt(restant < 0 ? 0 : restant),
        code: doc.code_tracage,
      })
    )
    window.open(`https://wa.me/${tel}?text=${msg}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-card border border-edge rounded-xl overflow-hidden">
      {/* En-tête de la carte */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-subtle transition"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <FileText size={15} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-ink">{doc.numero}</span>
            <span className="text-[11px] text-ghost">· {t(`facturation.types.${doc.type}`)}</span>
          </div>
          <p className="text-xs text-dim truncate">{doc.client_nom}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatutBadge statut={doc.statut} />
          <span className="text-sm font-semibold text-ink">{fmt(total)} {t('facturation.fcfa')}</span>
          {open ? <ChevronUp size={15} className="text-ghost" /> : <ChevronDown size={15} className="text-ghost" />}
        </div>
      </div>

      {/* Détails dépliables */}
      {open && (
        <div className="border-t border-edge px-4 py-4 space-y-4">
          {/* Lignes */}
          <div>
            <p className="text-xs font-semibold text-ghost uppercase tracking-wider mb-2">{t('facturation.modal.lignes')}</p>
            <div className="space-y-1.5">
              {(doc.lignes || []).map((l, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-dim">{l.description} <span className="text-ghost">× {l.quantite}</span></span>
                  <span className="font-medium text-ink">{fmt(l.quantite * l.prix_unitaire)} {t('facturation.fcfa')}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-edge mt-2 pt-2 flex justify-between font-bold text-sm">
              <span className="text-ink">{t('facturation.doc.total')}</span>
              <span className="text-ink">{fmt(total)} {t('facturation.fcfa')}</span>
            </div>
            {Number(doc.acompte) > 0 && (
              <div className="flex justify-between text-xs text-dim mt-1">
                <span>{t('facturation.doc.acompte_verse')}</span>
                <span>− {fmt(doc.acompte)} {t('facturation.fcfa')}</span>
              </div>
            )}
            {restant > 0 && (
              <div className="flex justify-between text-sm font-semibold text-primary mt-1">
                <span>{t('facturation.doc.restant')}</span>
                <span>{fmt(restant)} {t('facturation.fcfa')}</span>
              </div>
            )}
          </div>

          {/* Mode paiement */}
          <div className="text-sm text-dim">
            {t('facturation.doc.mode_paiement')} <span className="text-ink font-medium">{t(`facturation.modes.${doc.mode_paiement}`, doc.mode_paiement)}</span>
            {doc.date_echeance && (
              <span className="ml-3">{t('facturation.doc.echeance')} <span className="text-ink font-medium">{doc.date_echeance}</span></span>
            )}
          </div>

          {/* Code de traçage / QR */}
          {doc.code_tracage && (
            <div className="flex items-center gap-2 bg-subtle border border-edge rounded-lg px-3 py-2">
              <QrCode size={15} className="text-primary shrink-0" />
              <span className="text-xs font-mono text-ink">{doc.code_tracage}</span>
            </div>
          )}

          {/* Notes */}
          {doc.notes && (
            <p className="text-xs text-dim italic">{doc.notes}</p>
          )}

          {/* Changer statut */}
          <div>
            <p className="text-xs font-semibold text-ghost uppercase tracking-wider mb-2">{t('facturation.doc.statut')}</p>
            <div className="flex flex-wrap gap-2 items-center">
              {Object.entries(STATUTS).map(([k, s]) => (
                <button
                  key={k}
                  disabled={updatingStatut || doc.statut === k}
                  onClick={() => changeStatut(k)}
                  className={cn(
                    'text-xs font-semibold px-3 py-1.5 rounded-lg border transition disabled:opacity-50',
                    doc.statut === k
                      ? `${s.bg} ${s.color} border-transparent`
                      : 'border-edge text-dim hover:border-primary hover:text-primary',
                  )}
                >
                  {t(`facturation.statuts.${k}`)}
                </button>
              ))}
            </div>
            {doc.statut === 'acompte' && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-dim">{t('facturation.doc.montant_acompte')}</span>
                <input
                  type="number" min="0"
                  value={acompteInput}
                  onChange={(e) => setAcompteInput(e.target.value)}
                  className="w-28 rounded-lg border border-edge bg-app px-2 py-1 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  disabled={updatingStatut}
                  onClick={() => changeStatut('acompte')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-600 transition disabled:opacity-60"
                >
                  {t('facturation.doc.maj')}
                </button>
              </div>
            )}
          </div>

          {/* Normalisation DGI (e-MECeF) */}
          <div>
            <p className="text-xs font-semibold text-ghost uppercase tracking-wider mb-2">{t('facturation.doc.dgi_titre')}</p>
            {doc.emecef_code ? (
              <div className="space-y-2">
                <span className="text-xs text-success font-medium">{t('facturation.doc.dgi_normalisee')}</span>
                {qrDataUrl && (
                  <img src={qrDataUrl} alt={t('facturation.doc.dgi_qr')} className="w-28 h-28 border border-edge rounded-lg bg-white p-1" />
                )}
                <p className="text-[11px] font-mono text-dim break-all">{t('facturation.doc.dgi_code')} {doc.emecef_code}</p>
              </div>
            ) : doc.dgi_pdf_url ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-success font-medium">{t('facturation.doc.dgi_pdf_joint')}</span>
                  <a href={doc.dgi_pdf_url} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    <Download size={12} /> {t('facturation.doc.telecharger')}
                  </a>
                </div>
                <button onClick={habiller} disabled={habilling}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg border border-edge text-ink hover:border-primary hover:text-primary transition disabled:opacity-60">
                  <Printer size={14} /> {habilling ? t('facturation.doc.habillage_generation') : t('facturation.doc.imprimer_habillage')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {doc.type === 'facture' && peutNormaliser && (
                  <div>
                    <button onClick={normaliser} disabled={normalisant}
                      className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-600 transition disabled:opacity-60">
                      <ShieldCheck size={14} /> {normalisant ? t('facturation.doc.normalisation') : t('facturation.doc.normaliser')}
                    </button>
                    {normErr && <p className="text-xs text-danger mt-1">{normErr}</p>}
                  </div>
                )}
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-primary hover:underline">
                  <Upload size={14} />
                  {uploadingDgi ? t('facturation.doc.envoi') : t('facturation.doc.joindre_pdf')}
                  <input type="file" accept="application/pdf" onChange={uploadDgi} disabled={uploadingDgi} className="hidden" />
                </label>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1 border-t border-edge">
            <button
              onClick={sendWhatsApp}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-[#25D366] text-white hover:opacity-90 transition"
            >
              <MessageCircle size={15} /> {t('facturation.doc.whatsapp')}
            </button>
            <button
              onClick={telechargerPdf}
              disabled={pdfBusy}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-edge text-ink hover:border-primary hover:text-primary transition disabled:opacity-60"
            >
              <Download size={15} /> {pdfBusy ? t('facturation.doc.pdf_generation') : t('facturation.doc.pdf')}
            </button>
            <button
              onClick={() => onDelete(doc.id)}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-edge text-ghost hover:text-danger hover:border-danger transition"
            >
              <Trash2 size={13} /> {t('commun.supprimer')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FacturationPage() {
  const { t } = useTranslation()
  const { atelier } = useAuth()
  const [docs, setDocs] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState('tous')
  const [filterStatut, setFilterStatut] = useState('tous')

  const loadDocs = useCallback(async () => {
    try {
      const data = await factureService.getAll()
      setDocs(data || [])
    } catch { setDocs([]) }
  }, [])

  useEffect(() => { loadDocs() }, [loadDocs])

  const handleCreated = (doc) => setDocs((l) => [doc, ...(l || [])])

  const handleStatutChange = (updated) => {
    setDocs((l) => l.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)))
  }

  const handleDgiUploaded = (updated) => {
    setDocs((l) => l.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)))
  }

  const handleDelete = async (id) => {
    setDocs((l) => l.filter((d) => d.id !== id))
    try { await factureService.delete(id) } catch { /* silencieux */ }
  }

  const filtered = (docs || []).filter((d) => {
    if (filterType !== 'tous' && d.type !== filterType) return false
    if (filterStatut !== 'tous' && d.statut !== filterStatut) return false
    return true
  })

  const totaux = (docs || []).reduce(
    (acc, d) => {
      const tot = calcTotal(d.lignes || [])
      acc.total += tot
      if (d.statut === 'soldee') acc.encaisse += tot
      if (d.statut === 'non_payee' || d.statut === 'acompte') acc.restant += tot - (Number(d.acompte) || 0)
      return acc
    },
    { total: 0, encaisse: 0, restant: 0 },
  )

  return (
    <AppLayout>
      <FeatureGate featureKey="facturation" featureName={t('facturation.feature_name')}>
      <div className="max-w-3xl mx-auto px-4 pb-24 lg:pb-8">
        {/* En-tête */}
        <div className="pt-4 pb-3 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
              <FileText size={15} /> {t('facturation.titre')}
            </div>
            <h1 className="text-2xl font-bold font-display text-ink mt-1">{t('facturation.sous_titre')}</h1>
            <p className="text-sm text-dim mt-0.5">{t('facturation.description')}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-600 transition"
          >
            <Plus size={16} /> {t('facturation.nouveau')}
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: t('facturation.kpi_total'),    value: fmt(totaux.total)    },
            { label: t('facturation.kpi_encaisse'), value: fmt(totaux.encaisse) },
            { label: t('facturation.kpi_restant'),  value: fmt(totaux.restant)  },
          ].map((k) => (
            <div key={k.label} className="bg-card border border-edge rounded-xl p-3 text-center">
              <div className="text-lg font-bold font-display text-ink">{k.value}</div>
              <div className="text-[11px] text-ghost mt-0.5">{k.label} {t('facturation.fcfa')}</div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1 bg-subtle border border-edge rounded-xl p-0.5">
            {['tous', ...TYPES_DOC].map((ty) => (
              <button
                key={ty}
                onClick={() => setFilterType(ty)}
                className={cn(
                  'px-3 py-1.5 rounded-[10px] text-xs font-semibold transition',
                  filterType === ty ? 'bg-primary text-white' : 'text-ghost hover:text-ink',
                )}
              >
                {ty === 'tous' ? t('facturation.filtre_tous') : t(`facturation.types.${ty}`)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-subtle border border-edge rounded-xl p-0.5">
            {['tous', ...Object.keys(STATUTS)].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatut(st)}
                className={cn(
                  'px-3 py-1.5 rounded-[10px] text-xs font-semibold transition',
                  filterStatut === st ? 'bg-primary text-white' : 'text-ghost hover:text-ink',
                )}
              >
                {st === 'tous' ? t('facturation.filtre_tous_statuts') : t(`facturation.statuts.${st}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        {docs === null ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-card border border-edge rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-edge rounded-xl p-10 text-center">
            <FileText size={28} className="mx-auto text-ghost mb-2" />
            <p className="text-sm text-dim">
              {docs.length === 0 ? t('facturation.vide') : t('facturation.vide_filtres')}
            </p>
            {docs.length === 0 && (
              <button onClick={() => setShowForm(true)} className="mt-3 text-sm font-semibold text-primary hover:underline">
                {t('facturation.creer_premier')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                onStatutChange={handleStatutChange}
                onDgiUploaded={handleDgiUploaded}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <FormulaireModal
          onClose={() => setShowForm(false)}
          onCreated={handleCreated}
        />
      )}
      </FeatureGate>
    </AppLayout>
  )
}
