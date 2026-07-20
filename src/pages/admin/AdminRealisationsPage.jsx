import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X, ShieldCheck, Users, Clock, Loader2 } from 'lucide-react'
import { AdminLayout } from '@/components/admin'
import { realisationsAdminService } from '@/services/admin/realisationsAdminService'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

const STATUTS = ['en_attente', 'publiee', 'refusee']

export default function AdminRealisationsPage() {
  const { t } = useTranslation()
  const [statut, setStatut]   = useState('en_attente')
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId]   = useState(null)
  const [motifs, setMotifs]   = useState({}) // { [id]: texte }
  const [compteurs, setCompteurs] = useState(null)

  const charger = async (st = statut) => {
    setLoading(true)
    try {
      const [d, c] = await Promise.all([
        realisationsAdminService.getAll({ statut: st }),
        realisationsAdminService.compteurs(),
      ])
      setRows(d.data ?? d ?? [])
      setCompteurs(c)
    } finally { setLoading(false) }
  }

  useEffect(() => { charger(statut) }, [statut]) // eslint-disable-line react-hooks/exhaustive-deps

  const approuver = async (r) => {
    if (!window.confirm(t('realisations.admin.confirmer_approbation'))) return
    setBusyId(r.id)
    try { await realisationsAdminService.approuver(r.id); await charger() }
    finally { setBusyId(null) }
  }

  const refuser = async (r) => {
    const motif = (motifs[r.id] || '').trim()
    if (!motif) { window.alert(t('realisations.admin.motif_requis')); return }
    setBusyId(r.id)
    try { await realisationsAdminService.refuser(r.id, motif); await charger() }
    finally { setBusyId(null) }
  }

  return (
    <AdminLayout title={t('realisations.admin.titre')}>
      {/* Filtres par statut avec compteurs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STATUTS.map((st) => (
          <button key={st} onClick={() => setStatut(st)}
            className={cn('px-3 py-1.5 rounded-full text-sm font-medium border transition',
              statut === st ? 'bg-primary text-white border-primary' : 'bg-card text-dim border-edge hover:border-primary/40')}>
            {t(`realisations.statut.${st}`)}
            {compteurs && compteurs[st] > 0 && (
              <span className={cn('ml-1.5 text-xs', statut === st ? 'text-white/80' : 'text-ghost')}>{compteurs[st]}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ghost flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> {t('admin.commun.chargement')}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-ghost py-8 text-center">{t('realisations.admin.aucune')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-edge bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-ink truncate">{r.titre}</p>
                  <p className="text-xs text-ghost truncate">{t('realisations.admin.par')} {r.atelier?.nom || '—'}</p>
                </div>
                {r.soumis_at && (
                  <span className="text-[11px] text-ghost flex items-center gap-1 shrink-0">
                    <Clock size={12} /> {formatDate(r.soumis_at)}
                  </span>
                )}
              </div>

              {r.description && <p className="text-sm text-dim leading-relaxed">{r.description}</p>}

              {/* Aperçu des photos (originaux non filigranés en modération) */}
              <div className="grid grid-cols-3 gap-1.5">
                {(r.images || []).map((im, i) => (
                  <a key={i} href={im.url} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden bg-subtle block">
                    <img src={im.url} alt="" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>

              {/* Déclarations du professionnel */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                <span className={cn('flex items-center gap-1', r.certifie_auteur ? 'text-success' : 'text-ghost')}>
                  <ShieldCheck size={13} /> {t('realisations.admin.certifie')}
                </span>
                <span className={cn('flex items-center gap-1', r.consentement_personnes ? 'text-success' : 'text-ghost')}>
                  <Users size={13} /> {t('realisations.admin.consentement_ok')}
                </span>
              </div>

              {r.statut === 'refusee' && r.motif_refus && (
                <p className="text-xs text-danger">{t('realisations.motif_refus')} : {r.motif_refus}</p>
              )}

              {/* Actions (uniquement en attente) */}
              {r.statut === 'en_attente' && (
                <div className="space-y-2 pt-1">
                  <input value={motifs[r.id] || ''} onChange={(e) => setMotifs((m) => ({ ...m, [r.id]: e.target.value }))}
                         placeholder={t('realisations.admin.motif_placeholder')} maxLength={500}
                         className="w-full rounded-lg border border-edge bg-subtle px-3 py-1.5 text-xs text-ink placeholder:text-ghost outline-none focus:border-primary" />
                  <div className="flex gap-2">
                    <button onClick={() => approuver(r)} disabled={busyId === r.id}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50">
                      <Check size={15} /> {t('realisations.admin.approuver')}
                    </button>
                    <button onClick={() => refuser(r)} disabled={busyId === r.id}
                            className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50">
                      <X size={15} /> {t('realisations.admin.refuser')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
