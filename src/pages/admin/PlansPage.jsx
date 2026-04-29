import { useState } from 'react'
import { Plus, Edit2 } from 'lucide-react'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminPlans, useCreatePlan, useUpdatePlan, useTogglePlan } from '@/hooks/admin/usePlans'

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
}

const EMPTY_FORM = {
  cle: '', label: '', duree_jours: '', prix_xof: '', description_courte: '',
  config: { ...DEFAULT_CONFIG },
}

function NumField({ label, name, value, onChange, unlimited = false }) {
  const isUnlimited = value === -1 || value === null

  const handleChange = e => {
    const v = e.target.value
    if (v === '') { onChange(name, unlimited ? -1 : 0); return }
    onChange(name, Number(v))
  }

  return (
    <div>
      <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="number" min="0"
          value={isUnlimited ? '' : (value ?? '')}
          onChange={handleChange}
          disabled={isUnlimited}
          placeholder={isUnlimited ? '∞' : '0'}
          className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-400 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400"
        />
        {unlimited && (
          <button
            type="button"
            onClick={() => onChange(name, isUnlimited ? 0 : -1)}
            title={isUnlimited ? 'Définir une limite' : 'Illimité (-1)'}
            className={`px-2 rounded-lg border text-sm font-mono shrink-0 transition-colors ${isUnlimited ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:border-gray-300'}`}
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
      <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
      <button
        type="button"
        onClick={() => onChange(name, !value)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-4' : 'translate-x-1'}`} />
      </button>
    </label>
  )
}

function PlanModal({ initial, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState(() => {
    if (!initial) return { ...EMPTY_FORM, config: { ...DEFAULT_CONFIG } }
    const cfg = typeof initial.config === 'string' ? JSON.parse(initial.config) : (initial.config ?? {})
    return { ...initial, config: { ...DEFAULT_CONFIG, ...cfg } }
  })

  const isEdit = !!initial?.id
  const setField = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const setCfg = (key, val) => setForm(f => ({ ...f, config: { ...f.config, [key]: val } }))

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({
      ...form,
      duree_jours: Number(form.duree_jours),
      prix_xof: Number(form.prix_xof),
    })
  }

  const input = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
  const label = 'text-xs text-gray-500 dark:text-gray-400'
  const section = 'border-t border-gray-100 dark:border-gray-700 pt-3'
  const sectionTitle = 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg my-4">
        <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">{isEdit ? 'Modifier le plan' : 'Nouveau plan'}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-3">
            {!isEdit && (
              <div>
                <label className={label}>Clé unique</label>
                <input value={form.cle} onChange={setField('cle')} required placeholder="ex: premium_mensuel" className={input} />
              </div>
            )}
            <div>
              <label className={label}>Label</label>
              <input value={form.label} onChange={setField('label')} required className={input} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Durée (jours)</label>
                <input type="number" min="1" value={form.duree_jours} onChange={setField('duree_jours')} required className={input} />
              </div>
              <div>
                <label className={label}>Prix XOF</label>
                <input type="number" min="0" value={form.prix_xof} onChange={setField('prix_xof')} required className={input} />
              </div>
            </div>
            <div>
              <label className={label}>Description courte</label>
              <input value={form.description_courte ?? ''} onChange={setField('description_courte')} className={input} />
            </div>

            <div className={section}>
              <p className={sectionTitle}>Limites mensuelles</p>
              <div className="grid grid-cols-2 gap-3">
                <NumField label="Clients / mois"     name="max_clients_par_mois"    value={form.config.max_clients_par_mois}    onChange={setCfg} />
                <NumField label="Photos VIP / mois"  name="max_photos_vip_par_mois" value={form.config.max_photos_vip_par_mois} onChange={setCfg} unlimited />
                <NumField label="Factures / mois"    name="max_factures_par_mois"   value={form.config.max_factures_par_mois}   onChange={setCfg} unlimited />
                <NumField label="Membres équipe"     name="max_membres"             value={form.config.max_membres}             onChange={setCfg} />
                <NumField label="Assistants"         name="max_assistants"          value={form.config.max_assistants}          onChange={setCfg} />
                <NumField label="Sous-ateliers"      name="max_sous_ateliers"       value={form.config.max_sous_ateliers ?? 0}  onChange={setCfg} />
              </div>
            </div>

            <div className={section}>
              <p className={sectionTitle}>Fidélité</p>
              <div className="grid grid-cols-3 gap-3">
                <NumField label="Pts / client"   name="pts_par_client"   value={form.config.pts_par_client}   onChange={setCfg} />
                <NumField label="Pts / commande" name="pts_par_commande" value={form.config.pts_par_commande} onChange={setCfg} />
                <NumField label="Pts activation" name="pts_activation"   value={form.config.pts_activation}   onChange={setCfg} />
              </div>
              <div className="mt-3">
                <NumField label="Seuil conversion (pts → jours)" name="seuil_conversion_pts" value={form.config.seuil_conversion_pts} onChange={setCfg} />
              </div>
            </div>

            <div className={section}>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Fonctionnalités incluses</p>
              <Toggle label="Photos VIP"           name="photos_vip"       value={form.config.photos_vip}       onChange={setCfg} />
              <Toggle label="Facture WhatsApp"     name="facture_whatsapp" value={form.config.facture_whatsapp} onChange={setCfg} />
              <Toggle label="Sauvegarde auto"      name="sauvegarde_auto"  value={form.config.sauvegarde_auto}  onChange={setCfg} />
              <Toggle label="Module caisse"        name="module_caisse"    value={form.config.module_caisse}    onChange={setCfg} />
              <Toggle label="Multi-ateliers"       name="multi_ateliers"   value={form.config.multi_ateliers}   onChange={setCfg} />
              <Toggle label="Export PDF"           name="export_pdf"       value={form.config.export_pdf}       onChange={setCfg} />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Annuler</button>
            <button type="submit" disabled={isLoading}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PlansPage() {
  const { data: plans = [], isLoading } = useAdminPlans()
  const create = useCreatePlan()
  const update = useUpdatePlan()
  const toggle = useTogglePlan()
  const [modal, setModal] = useState(null)

  const columns = [
    { key: 'cle',       label: 'Clé' },
    { key: 'label',     label: 'Label' },
    { key: 'duree_jours', label: 'Durée',  render: r => `${r.duree_jours} j` },
    { key: 'prix_xof',  label: 'Prix',    render: r => `${Number(r.prix_xof ?? 0).toLocaleString()} XOF` },
    { key: 'is_actif',  label: 'Statut',  render: r => <AdminBadge value={r.is_actif ? 'actif' : 'expire'} /> },
    { key: 'abonnements_count', label: 'Abonnés' },
    {
      key: 'actions', label: '',
      render: r => (
        <div className="flex gap-3">
          <button onClick={() => setModal(r)} className="text-indigo-500 hover:text-indigo-700"><Edit2 size={14} /></button>
          <button onClick={() => toggle.mutate(r.id)}
            className={`text-xs hover:underline ${r.is_actif ? 'text-red-500' : 'text-green-600'}`}>
            {r.is_actif ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      ),
    },
  ]

  const handleCreate = async data => { await create.mutateAsync(data); setModal(null) }
  const handleUpdate = async data => { await update.mutateAsync({ id: modal.id, ...data }); setModal(null) }

  return (
    <AdminLayout title="Plans d'abonnement">
      <div className="flex justify-end mb-4">
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Plus size={14} /> Nouveau plan
        </button>
      </div>

      {isLoading ? <p className="text-sm text-gray-400">Chargement…</p> : (
        <AdminTable columns={columns} rows={plans} emptyLabel="Aucun plan" />
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
