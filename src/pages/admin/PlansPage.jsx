import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit2 } from 'lucide-react'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminPlans, useCreatePlan, useUpdatePlan, useTogglePlan, useFonctionnalites } from '@/hooks/admin/usePlans'
import { cn } from '@/utils/cn'

const DEFAULT_CONFIG = {
  max_clients_par_mois:    50,
  max_assistants:          0,
  max_membres:             0,
  max_sous_ateliers:       0,
  max_photos_vip_par_mois: -1,
  max_factures_par_mois:   -1,
  pts_par_client:          1,
  pts_par_commande:        1,
  pts_activation:          30,
  seuil_conversion_pts:    10000,
  photos_vip:              false,
  facture_whatsapp:        false,
  sauvegarde_auto:         false,
  module_caisse:           false,
  multi_ateliers:          false,
  export_pdf:              false,
  max_creations_vitrine:   5,
  max_commandes_par_mois:  -1,
  visible_galerie:         true,
}

// Clés qui ont un champ dédié dans le formulaire (le reste tombe dans « Autres clés »).
const KNOWN_KEYS = [
  'max_clients_par_mois', 'max_assistants', 'max_membres', 'max_sous_ateliers',
  'max_photos_vip_par_mois', 'max_factures_par_mois', 'pts_par_client', 'pts_par_commande',
  'pts_activation', 'seuil_conversion_pts', 'photos_vip', 'facture_whatsapp', 'sauvegarde_auto',
  'module_caisse', 'multi_ateliers', 'export_pdf',
  'max_creations_vitrine', 'max_commandes_par_mois', 'visible_galerie',
]

// Devine le type d'une valeur saisie (booléen / nombre / chaîne).
function parseConfigVal(v) {
  if (v === 'true') return true
  if (v === 'false') return false
  if (v !== '' && !Number.isNaN(Number(v))) return Number(v)
  return v
}

const EMPTY_FORM = {
  cle: '', label: '', duree_jours: '', prix_xof: '', description_courte: '',
  config: { ...DEFAULT_CONFIG },
}

const INPUT     = 'w-full border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-subtle disabled:text-ghost'
const LABEL     = 'text-xs text-ghost block mb-1'
const SECTION   = 'border-t border-edge pt-3'
const SECT_HEAD = 'text-2xs font-semibold text-ghost uppercase tracking-widest mb-3'

function NumField({ label, name, value, onChange, unlimited = false }) {
  const isUnlimited = value === -1 || value === null

  const handleChange = e => {
    const v = e.target.value
    if (v === '') { onChange(name, unlimited ? -1 : 0); return }
    onChange(name, Number(v))
  }

  return (
    <div>
      <label className={LABEL}>{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          value={isUnlimited ? '' : (value ?? '')}
          onChange={handleChange}
          disabled={isUnlimited}
          placeholder={isUnlimited ? '∞' : '0'}
          className={INPUT}
        />
        {unlimited && (
          <button
            type="button"
            onClick={() => onChange(name, isUnlimited ? 0 : -1)}
            title={isUnlimited ? 'Définir une limite' : 'Illimité (-1)'}
            className={cn(
              'px-2.5 rounded-xl border text-sm font-mono shrink-0 transition-colors',
              isUnlimited
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'border-edge text-ghost hover:border-edge-strong',
            )}
          >
            ∞
          </button>
        )}
      </div>
    </div>
  )
}

function Toggle({ label, name, value, onChange }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <span className="text-sm text-dim">{label}</span>
      <button
        type="button"
        onClick={() => onChange(name, !value)}
        className={cn(
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
          value ? 'bg-primary' : 'bg-inset',
        )}
      >
        <span className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-card transition-transform',
          value ? 'translate-x-4' : 'translate-x-1',
        )} />
      </button>
    </label>
  )
}

function PlanModal({ initial, onClose, onSubmit, isLoading }) {
  const { t } = useTranslation()
  // S02A-28b : libellés et types des clés configurables, servis par le serveur.
  const { data: referentiel = [] } = useFonctionnalites()
  const [form, setForm] = useState(() => {
    if (!initial) return { ...EMPTY_FORM, config: { ...DEFAULT_CONFIG } }
    const cfg = typeof initial.config === 'string' ? JSON.parse(initial.config) : (initial.config ?? {})
    return { ...initial, config: { ...DEFAULT_CONFIG, ...cfg } }
  })

  const isEdit   = !!initial?.id
  const setField = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const setCfg   = (key, val) => setForm(f => ({ ...f, config: { ...f.config, [key]: val } }))
  const removeCfg = key => setForm(f => { const c = { ...f.config }; delete c[key]; return { ...f, config: c } })
  const [newKey, setNewKey] = useState('')
  const addKey = () => { const k = newKey.trim(); if (k && !(k in form.config)) { setCfg(k, ''); setNewKey('') } }

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({ ...form, duree_jours: Number(form.duree_jours), prix_xof: Number(form.prix_xof) })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl w-full max-w-lg my-auto sm:my-4 shadow-xl">
        <div className="px-6 pt-5 pb-3 border-b border-edge">
          <h3 className="font-semibold text-ink">
            {isEdit ? t('admin.plans.modifier') : t('admin.plans.nouveau')}
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-3">
            {!isEdit && (
              <div>
                <label className={LABEL}>{t('admin.plans.form_cle')}</label>
                <input value={form.cle} onChange={setField('cle')} required placeholder="ex: premium_mensuel" className={INPUT} />
              </div>
            )}
            <div>
              <label className={LABEL}>{t('admin.plans.form_label')}</label>
              <input value={form.label} onChange={setField('label')} required className={INPUT} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>{t('admin.plans.form_duree')}</label>
                <input type="number" min="1" value={form.duree_jours} onChange={setField('duree_jours')} required className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>{t('admin.plans.form_prix')}</label>
                <input type="number" min="0" value={form.prix_xof} onChange={setField('prix_xof')} required className={INPUT} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t('admin.plans.form_description')}</label>
              <input value={form.description_courte ?? ''} onChange={setField('description_courte')} className={INPUT} />
            </div>

            <div className={SECTION}>
              <p className={SECT_HEAD}>{t('admin.plans.section_limites')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <NumField label={t('admin.plans.clients_mois')}    name="max_clients_par_mois"    value={form.config.max_clients_par_mois}    onChange={setCfg} />
                <NumField label={t('admin.plans.photos_vip_mois')} name="max_photos_vip_par_mois" value={form.config.max_photos_vip_par_mois} onChange={setCfg} unlimited />
                <NumField label={t('admin.plans.factures_mois')}   name="max_factures_par_mois"   value={form.config.max_factures_par_mois}   onChange={setCfg} unlimited />
                <NumField label={t('admin.plans.membres')}         name="max_membres"             value={form.config.max_membres}             onChange={setCfg} />
                <NumField label={t('admin.plans.assistants')}      name="max_assistants"          value={form.config.max_assistants}          onChange={setCfg} />
                <NumField label={t('admin.plans.sous_ateliers')}   name="max_sous_ateliers"       value={form.config.max_sous_ateliers ?? 0}  onChange={setCfg} />
              </div>
            </div>

            <div className={SECTION}>
              <p className={SECT_HEAD}>Vitrine</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <NumField label="Créations publiables (galerie)" name="max_creations_vitrine"  value={form.config.max_creations_vitrine ?? 0}  onChange={setCfg} unlimited />
                <NumField label="Commandes / mois"               name="max_commandes_par_mois" value={form.config.max_commandes_par_mois ?? -1} onChange={setCfg} unlimited />
              </div>
              <div className="mt-1">
                <Toggle label="Visible dans la galerie" name="visible_galerie" value={form.config.visible_galerie} onChange={setCfg} />
              </div>
            </div>

            <div className={SECTION}>
              <p className={SECT_HEAD}>{t('admin.plans.section_fidelite')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <NumField label={t('admin.plans.pts_client')}     name="pts_par_client"   value={form.config.pts_par_client}   onChange={setCfg} />
                <NumField label={t('admin.plans.pts_commande')}   name="pts_par_commande" value={form.config.pts_par_commande} onChange={setCfg} />
                <NumField label={t('admin.plans.pts_activation')} name="pts_activation"   value={form.config.pts_activation}   onChange={setCfg} />
              </div>
              <div className="mt-3">
                <NumField label={t('admin.plans.seuil_conversion')} name="seuil_conversion_pts" value={form.config.seuil_conversion_pts} onChange={setCfg} />
              </div>
            </div>

            <div className={SECTION}>
              <p className={SECT_HEAD}>{t('admin.plans.section_fonctionnalites')}</p>
              <Toggle label="Photos VIP"       name="photos_vip"       value={form.config.photos_vip}       onChange={setCfg} />
              <Toggle label="Facture WhatsApp" name="facture_whatsapp" value={form.config.facture_whatsapp} onChange={setCfg} />
              <Toggle label="Sauvegarde auto"  name="sauvegarde_auto"  value={form.config.sauvegarde_auto}  onChange={setCfg} />
              <Toggle label="Module caisse"    name="module_caisse"    value={form.config.module_caisse}    onChange={setCfg} />
              <Toggle label="Multi-ateliers"   name="multi_ateliers"   value={form.config.multi_ateliers}   onChange={setCfg} />
              <Toggle label="Export PDF"       name="export_pdf"       value={form.config.export_pdf}       onChange={setCfg} />
            </div>

            {/* S02A-28b : les clés qui n'ont pas de champ dédié étaient affichées
                en BRUT (« max_photos_vetement »), sans libellé ni type, et la
                liste dérivait à chaque migration. Elles sont maintenant rendues
                depuis le référentiel serveur, avec leur vrai libellé et le bon
                type de champ. Toute clé ajoutée par une future migration
                apparaît ici sans retoucher cet écran. */}
            <div className={SECTION}>
              <p className={SECT_HEAD}>{t('admin.plans.section_avancee')}</p>
              {referentiel
                .filter(f => !KNOWN_KEYS.includes(f.cle))
                .map(f => (
                  f.type === 'booleen'
                    ? <Toggle key={f.cle} label={f.label} name={f.cle}
                              value={form.config[f.cle] ?? false} onChange={setCfg} />
                    : f.type === 'numerique'
                      ? <div key={f.cle} className="mb-2">
                          <NumField label={f.unite ? `${f.label} (${f.unite})` : f.label}
                                    name={f.cle} value={form.config[f.cle] ?? 0}
                                    onChange={setCfg} unlimited />
                          {f.description && <p className="text-2xs text-ghost mt-0.5">{f.description}</p>}
                        </div>
                      : <div key={f.cle} className="mb-2">
                          <label className={LABEL}>{f.label}</label>
                          <input value={String(form.config[f.cle] ?? '')}
                                 onChange={e => setCfg(f.cle, parseConfigVal(e.target.value))}
                                 className={INPUT} />
                        </div>
                ))}

              {/* Clés présentes dans la configuration mais absentes du référentiel :
                  vestiges d'anciennes livraisons. On les garde éditables et
                  supprimables plutôt que de les masquer silencieusement. */}
              {Object.keys(form.config)
                .filter(k => !KNOWN_KEYS.includes(k) && !referentiel.some(f => f.cle === k))
                .map(k => (
                <div key={k} className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-dim flex-1 truncate" title={k}>{k}</span>
                  <input value={String(form.config[k] ?? '')} onChange={e => setCfg(k, parseConfigVal(e.target.value))} className={INPUT + ' max-w-[160px]'} />
                  <button type="button" onClick={() => removeCfg(k)} className="text-ghost hover:text-danger text-sm px-1" title={t('commun.retirer')}>✕</button>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="nouvelle_cle" className={INPUT + ' max-w-[200px]'} />
                <button type="button" onClick={addKey} className="text-sm font-medium text-primary whitespace-nowrap">+ Ajouter</button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-edge">
            <button type="button" onClick={onClose} className="text-sm text-ghost hover:text-dim transition-colors">
              {t('admin.commun.annuler')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-inverse text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? t('admin.plans.enregistrement') : t('admin.plans.enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PlansPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useAdminPlans({ page, per_page: 15 })
  const plans       = data?.data         ?? data ?? []
  const currentPage = data?.current_page ?? 1
  const lastPage    = data?.last_page    ?? 1

  const create = useCreatePlan()
  const update = useUpdatePlan()
  const toggle = useTogglePlan()
  const [modal, setModal] = useState(null)

  const columns = [
    { key: 'cle',   label: t('admin.plans.col_cle'),
      render: r => <span className="font-mono text-xs text-ink">{r.cle}</span>,
    },
    { key: 'label', label: t('admin.plans.col_label') },
    { key: 'duree_jours', label: t('admin.plans.col_duree'), render: r => `${r.duree_jours} j` },
    {
      key: 'prix_xof',
      label: t('admin.plans.col_prix'),
      render: r => (
        <span className="font-semibold text-ink tabular-nums">
          {Number(r.prix_xof ?? 0).toLocaleString()}{' '}
          <span className="text-ghost font-normal text-xs">XOF</span>
        </span>
      ),
    },
    { key: 'is_actif',          label: t('admin.plans.col_statut'),  render: r => <AdminBadge value={r.is_actif ? 'actif' : 'expire'} /> },
    { key: 'abonnements_count', label: t('admin.plans.col_abonnes') },
    {
      key: 'actions',
      label: '',
      render: r => (
        <div className="flex items-center gap-3">
          <button onClick={() => setModal(r)} className="text-ghost hover:text-primary transition-colors">
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => toggle.mutate(r.id)}
            className={cn(
                'text-xs font-medium transition-colors',
                r.is_actif ? 'text-danger hover:text-danger/70' : 'text-success hover:text-success/70',
              )}
          >
            {r.is_actif ? t('admin.plans.desactiver') : t('admin.plans.activer')}
          </button>
        </div>
      ),
    },
  ]

  const handleCreate = async data => { await create.mutateAsync(data); setModal(null) }
  const handleUpdate = async data => { await update.mutateAsync({ id: modal.id, ...data }); setModal(null) }

  return (
    <AdminLayout title={t('admin.plans.titre')}>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 bg-primary text-inverse text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
        >
          <Plus size={14} /> {t('admin.plans.nouveau')}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ghost">{t('admin.commun.chargement')}</p>
      ) : (
        <AdminTable
          columns={columns}
          rows={plans}
          emptyLabel={t('admin.plans.aucun')}
          currentPage={currentPage}
          lastPage={lastPage}
          onPage={setPage}
        />
      )}

      {modal === 'create' && (
        <PlanModal onClose={() => setModal(null)} onSubmit={handleCreate} isLoading={create.isPending} />
      )}
      {modal && modal !== 'create' && (
        <PlanModal initial={modal} onClose={() => setModal(null)} onSubmit={handleUpdate} isLoading={update.isPending} />
      )}
    </AdminLayout>
  )
}
