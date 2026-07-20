import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Images, Plus, Trash2, Send, ImagePlus, X, Pencil, AlertTriangle, Info } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Button, Badge, Modal, Input, EmptyState, Skeleton } from '@/components/ui'
import { realisationService } from '@/services/realisationService'
import { compressImage } from '@/utils/compressImage'
import { cn } from '@/utils/cn'
import { formatDateShort } from '@/utils/formatDate'

const MAX_PHOTOS = 6

const STATUT_META = {
  brouillon:  { variant: 'default' },
  en_attente: { variant: 'warning' },
  publiee:    { variant: 'success' },
  refusee:    { variant: 'danger' },
}

function StatutBadge({ statut }) {
  const { t } = useTranslation()
  const meta = STATUT_META[statut] || STATUT_META.brouillon
  return <Badge variant={meta.variant}>{t(`realisations.statut.${statut}`)}</Badge>
}

export default function MesRealisationsPage() {
  const { t } = useTranslation()
  const [items, setItems]     = useState([])
  const [quota, setQuota]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // réalisation en cours d'édition (ou null)
  const [erreur, setErreur]   = useState('')

  const charger = async () => {
    try {
      const d = await realisationService.list()
      setItems(d.realisations || [])
      setQuota(d.quota || null)
    } catch { setErreur(t('realisations.erreur_chargement')) }
    finally { setLoading(false) }
  }

  useEffect(() => { charger() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const supprimer = async (r) => {
    if (!window.confirm(t('realisations.confirmer_suppression'))) return
    await realisationService.remove(r.id)
    charger()
  }

  return (
    <AppLayout title={t('realisations.titre')} showBack>
      <div className="max-w-3xl mx-auto p-4 space-y-4">

        {/* Bandeau explicatif + quota */}
        <div className="rounded-2xl border border-edge bg-subtle p-4">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Info size={18} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink leading-relaxed">{t('realisations.intro')}</p>
              {quota && (
                <p className="text-xs text-ghost mt-2">
                  {/* PHOTO-4 : le quota du PLAN manquait — l'utilisateur ne voyait que
                      la limite anti-abus hebdomadaire et découvrait le vrai plafond
                      au moment d'être bloqué. Le cycle repart le 22 de chaque mois. */}
                  {quota.cycle && !quota.cycle.illimite && (
                    <>
                      {t('realisations.quota_cycle', {
                        n: quota.cycle.utilise,
                        max: quota.cycle.max,
                        reset: formatDateShort(quota.cycle.prochain_reset),
                      })}
                      {' · '}
                    </>
                  )}
                  {t('realisations.quota_semaine', { n: quota.envois_restants, max: quota.max_envois_semaine })}
                  {' · '}
                  {t('realisations.quota_cache', { n: quota.cache_local_utilise, max: quota.cache_local_max })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* PHOTO-4 : prévenir AVANT le blocage. `alerte` (>= 80 %) et `bloque`
            viennent du serveur : le front ne recalcule aucun seuil. */}
        {quota?.cycle?.alerte && (
          <div className={cn(
            'rounded-2xl border p-3 flex items-start gap-2.5 text-xs',
            quota.cycle.bloque
              ? 'border-danger/30 bg-danger/5 text-danger'
              : 'border-warning/30 bg-warning/5 text-warning',
          )}>
            <AlertTriangle size={15} className="shrink-0 mt-px" />
            <p className="leading-relaxed">
              {quota.cycle.bloque
                ? t('realisations.quota_bloque', { reset: formatDateShort(quota.cycle.prochain_reset) })
                : t('realisations.quota_alerte', { n: quota.cycle.restant })}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button disabled={quota?.cycle?.bloque}
                  onClick={() => setEditing({ nouveau: true, titre: '', description: '', images: [], statut: 'brouillon' })}>
            <Plus size={16} /> {t('realisations.nouvelle')}
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={Images} title={t('realisations.vide_titre')} description={t('realisations.vide_desc')} />
        ) : (
          <div className="space-y-3">
            {items.map((r) => (
              <div key={r.id} className="rounded-2xl border border-edge bg-card p-3 flex gap-3">
                <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-subtle flex items-center justify-center">
                  {r.images?.[0]?.url
                    ? <img src={r.images[0].watermark_url || r.images[0].url} alt="" className="w-full h-full object-cover" />
                    : <Images size={22} className="text-ghost" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-ink truncate">{r.titre}</p>
                    <StatutBadge statut={r.statut} />
                  </div>
                  {r.description && <p className="text-xs text-dim line-clamp-2 mt-0.5">{r.description}</p>}
                  <p className="text-[11px] text-ghost mt-0.5">{t('realisations.n_photos', { n: r.images?.length || 0 })}</p>

                  {r.statut === 'refusee' && r.motif_refus && (
                    <p className="text-xs text-danger mt-1 flex items-start gap-1">
                      <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                      <span>{t('realisations.motif_refus')} : {r.motif_refus}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    {(r.statut === 'brouillon' || r.statut === 'refusee') && (
                      <button onClick={() => setEditing(r)} className="text-xs font-medium text-primary flex items-center gap-1">
                        <Pencil size={13} /> {t('realisations.editer')}
                      </button>
                    )}
                    {r.statut !== 'en_attente' && (
                      <button onClick={() => supprimer(r)} className="text-xs font-medium text-ghost hover:text-danger flex items-center gap-1">
                        <Trash2 size={13} /> {t('commun.supprimer')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {erreur && <p className="text-sm text-danger text-center">{erreur}</p>}
      </div>

      {editing && (
        <EditeurRealisation
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); charger() }}
        />
      )}
    </AppLayout>
  )
}

/* Éditeur : création puis ajout de photos, certification/consentement bloquants, soumission. */
function EditeurRealisation({ initial, onClose, onSaved }) {
  const { t } = useTranslation()
  const fileRef = useRef(null)
  const [rea, setRea]       = useState(initial.nouveau ? null : initial)
  const [titre, setTitre]   = useState(initial.titre || '')
  const [desc, setDesc]     = useState(initial.description || '')
  const [certif, setCertif] = useState(false)
  const [consent, setConsent] = useState(false)
  const [busy, setBusy]     = useState(false)
  const [err, setErr]       = useState('')

  const editable = !rea || rea.statut === 'brouillon' || rea.statut === 'refusee'
  const images = rea?.images || []

  // Enregistre le brouillon (crée si nouveau, sinon met à jour titre/description).
  const enregistrer = async () => {
    if (!titre.trim()) { setErr(t('realisations.titre_requis')); return null }
    setErr(''); setBusy(true)
    try {
      const payload = { titre: titre.trim(), description: desc.trim() || null }
      const saved = rea
        ? await realisationService.update(rea.id, payload)
        : await realisationService.create(payload)
      setRea(saved)
      return saved
    } catch (e) {
      setErr(e?.response?.data?.message || t('realisations.erreur_enregistrement'))
      return null
    } finally { setBusy(false) }
  }

  const ajouterPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (file) e.target.value = ''
    if (!file) return
    // Il faut un brouillon existant pour rattacher la photo.
    let cible = rea
    if (!cible) { cible = await enregistrer(); if (!cible) return }
    if ((cible.images?.length || 0) >= MAX_PHOTOS) { setErr(t('realisations.max_photos', { n: MAX_PHOTOS })); return }
    setBusy(true); setErr('')
    try {
      const compressed = await compressImage(file)
      const saved = await realisationService.addPhoto(cible.id, compressed)
      setRea(saved)
    } catch (e2) {
      setErr(e2?.response?.data?.message || t('realisations.erreur_photo'))
    } finally { setBusy(false) }
  }

  const retirerPhoto = async (path) => {
    setBusy(true)
    try { setRea(await realisationService.removePhoto(rea.id, path)) }
    catch (e) { setErr(e?.response?.data?.message || t('realisations.erreur_photo')) }
    finally { setBusy(false) }
  }

  const soumettre = async () => {
    // On enregistre d'abord d'éventuelles modifications de titre/description.
    const saved = await enregistrer()
    if (!saved) return
    if ((saved.images?.length || 0) === 0) { setErr(t('realisations.photo_requise')); return }
    setBusy(true); setErr('')
    try {
      await realisationService.submit(saved.id)
      onSaved()
    } catch (e) {
      setErr(e?.response?.data?.message || t('realisations.erreur_soumission'))
    } finally { setBusy(false) }
  }

  return (
    <Modal isOpen onClose={onClose} title={t('realisations.editeur_titre')} size="lg">
      <div className="space-y-4">
        <Input label={t('realisations.champ_titre')} value={titre} onChange={(e) => setTitre(e.target.value)}
               placeholder={t('realisations.titre_placeholder')} maxLength={120} disabled={!editable} required />

        <div>
          <label className="text-sm font-medium text-ink">{t('realisations.champ_description')}</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={2000} disabled={!editable}
                    placeholder={t('realisations.description_placeholder')}
                    className="mt-1 w-full rounded-xl border border-edge bg-card px-3 py-2 text-sm text-ink placeholder:text-ghost focus:border-primary outline-none disabled:opacity-60" />
        </div>

        {/* Photos */}
        <div>
          <p className="text-sm font-medium text-ink mb-1.5">{t('realisations.photos')} ({images.length}/{MAX_PHOTOS})</p>
          <div className="grid grid-cols-3 gap-2">
            {images.map((im) => (
              <div key={im.path} className="relative aspect-square rounded-xl overflow-hidden bg-subtle">
                <img src={im.watermark_url || im.url} alt="" className="w-full h-full object-cover" />
                {editable && (
                  <button onClick={() => retirerPhoto(im.path)} disabled={busy}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center">
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
            {editable && images.length < MAX_PHOTOS && (
              <button onClick={() => fileRef.current?.click()} disabled={busy}
                      className="aspect-square rounded-xl border-2 border-dashed border-edge flex flex-col items-center justify-center gap-1 text-ghost hover:border-primary hover:text-primary transition">
                <ImagePlus size={20} />
                <span className="text-[11px]">{t('realisations.ajouter_photo')}</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={ajouterPhoto} />
        </div>

        {/* Certification + consentement (bloquants pour la soumission) */}
        {editable && (
          <div className="space-y-2.5 rounded-xl bg-subtle border border-edge p-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={certif} onChange={(e) => setCertif(e.target.checked)}
                     className="mt-0.5 w-4 h-4 accent-primary shrink-0" />
              <span className="text-xs text-dim leading-relaxed">{t('realisations.certif_auteur')}</span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                     className="mt-0.5 w-4 h-4 accent-primary shrink-0" />
              <span className="text-xs text-dim leading-relaxed">{t('realisations.consentement')}</span>
            </label>
          </div>
        )}

        {err && <p className="text-sm text-danger">{err}</p>}

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={busy}>{t('commun.fermer')}</Button>
          {editable && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={enregistrer} loading={busy}>{t('realisations.enregistrer_brouillon')}</Button>
              <Button onClick={soumettre} loading={busy} disabled={!certif || !consent}>
                <Send size={15} /> {t('realisations.soumettre')}
              </Button>
            </div>
          )}
        </div>
        {editable && (!certif || !consent) && (
          <p className={cn('text-[11px] text-ghost text-right')}>{t('realisations.certif_hint')}</p>
        )}
      </div>
    </Modal>
  )
}
