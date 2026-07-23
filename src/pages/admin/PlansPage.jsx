import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit2, X } from 'lucide-react'
import {
  AdminLayout, AdminTable, AdminBadge,
  AdminModal, AdminField, AdminNumberField, AdminToggle, AdminFormSection, AdminFormGrid,
  ADMIN_INPUT,
} from '@/components/admin'
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
  cle: '', label: '', label_en: '', type_compte: 'tous', visible_vitrine: true, visible_app: true,
  duree_jours: '', prix_xof: '', description_courte: '', description_courte_en: '',
  config: { ...DEFAULT_CONFIG },
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
    <AdminModal
      onClose={onClose}
      title={isEdit ? t('admin.plans.modifier') : t('admin.plans.nouveau')}
      size="4xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="text-sm text-ghost hover:text-dim transition-colors">
            {t('admin.commun.annuler')}
          </button>
          <button
            type="submit"
            form="plan-form"
            disabled={isLoading}
            className="bg-primary text-inverse text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {isLoading ? t('admin.plans.enregistrement') : t('admin.plans.enregistrer')}
          </button>
        </>
      }
    >
      {/* 2 colonnes : le formulaire empilait 6 sections en une seule colonne
          étroite — beaucoup de défilement pour peu de largeur utilisée. */}
      <form id="plan-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3">
        <div className="space-y-3">
          {!isEdit && (
            <AdminField label={t('admin.plans.form_cle')} value={form.cle} onChange={setField('cle')} required placeholder="ex: premium_mensuel" />
          )}
          <AdminField label={t('admin.plans.form_label')} value={form.label} onChange={setField('label')} required />
          {/* Le nom et l'accroche viennent de la BASE, pas des traductions :
              sans version anglaise, la page de tarifs restait a moitie en
              francais une fois la langue basculee. Laisse vide, le francais
              est servi — mieux qu'un champ vide sur une page de tarifs. */}
          <AdminField label={t('admin.plans.form_label_en')} value={form.label_en ?? ''} onChange={setField('label_en')} />
          <AdminFormGrid cols={2}>
            <AdminField label={t('admin.plans.form_duree')} type="number" min="1" value={form.duree_jours} onChange={setField('duree_jours')} required />
            {/* À qui s'adresse ce plan, et où il apparaît. Sans ces trois
                réglages, créer un plan réservé aux artisans ou le retirer de la
                vitrine demandait un développeur. */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-dim mb-1">{t('admin.plans.form_type')}</label>
              <select value={form.type_compte} onChange={setField('type_compte')} className={ADMIN_INPUT}>
                <option value="tous">{t('admin.plans.type_tous')}</option>
                <option value="artisan">{t('admin.plans.type_artisan')}</option>
                <option value="designer">{t('admin.plans.type_designer')}</option>
              </select>
            </div>
            <AdminToggle label={t('admin.plans.form_visible_vitrine')} name="visible_vitrine"
                         value={form.visible_vitrine} onChange={(n, v) => setForm(f => ({ ...f, [n]: v }))} />
            <AdminToggle label={t('admin.plans.form_visible_app')} name="visible_app"
                         value={form.visible_app} onChange={(n, v) => setForm(f => ({ ...f, [n]: v }))} />
            <AdminField label={t('admin.plans.form_prix')}  type="number" min="0" value={form.prix_xof}    onChange={setField('prix_xof')}    required />
          </AdminFormGrid>
          <AdminField label={t('admin.plans.form_description')} value={form.description_courte ?? ''} onChange={setField('description_courte')} />
          <AdminField label={t('admin.plans.form_description_en')} value={form.description_courte_en ?? ''} onChange={setField('description_courte_en')} />

          <AdminFormSection title={t('admin.plans.section_limites')} cols={2}>
            <AdminNumberField label={t('admin.plans.clients_mois')}    name="max_clients_par_mois"    value={form.config.max_clients_par_mois}    onChange={setCfg} />
            <AdminNumberField label={t('admin.plans.photos_vip_mois')} name="max_photos_vip_par_mois" value={form.config.max_photos_vip_par_mois} onChange={setCfg} unlimited />
            <AdminNumberField label={t('admin.plans.factures_mois')}   name="max_factures_par_mois"   value={form.config.max_factures_par_mois}   onChange={setCfg} unlimited />
            <AdminNumberField label={t('admin.plans.membres')}         name="max_membres"             value={form.config.max_membres}             onChange={setCfg} />
            <AdminNumberField label={t('admin.plans.assistants')}      name="max_assistants"          value={form.config.max_assistants}          onChange={setCfg} />
            <AdminNumberField label={t('admin.plans.sous_ateliers')}   name="max_sous_ateliers"       value={form.config.max_sous_ateliers ?? 0}  onChange={setCfg} />
          </AdminFormSection>

          <AdminFormSection title="Vitrine">
            <AdminFormGrid cols={2}>
              <AdminNumberField label="Créations publiables (galerie)" name="max_creations_vitrine"  value={form.config.max_creations_vitrine ?? 0}  onChange={setCfg} unlimited />
              <AdminNumberField label="Commandes / mois"               name="max_commandes_par_mois" value={form.config.max_commandes_par_mois ?? -1} onChange={setCfg} unlimited />
            </AdminFormGrid>
            <div className="mt-1">
              <AdminToggle label="Visible dans la galerie" name="visible_galerie" value={form.config.visible_galerie} onChange={setCfg} />
            </div>
          </AdminFormSection>
        </div>

        <div className="space-y-3">
          <AdminFormSection title={t('admin.plans.section_fidelite')} premiereColonne>
            <AdminFormGrid cols={3}>
              <AdminNumberField label={t('admin.plans.pts_client')}     name="pts_par_client"   value={form.config.pts_par_client}   onChange={setCfg} />
              <AdminNumberField label={t('admin.plans.pts_commande')}   name="pts_par_commande" value={form.config.pts_par_commande} onChange={setCfg} />
              <AdminNumberField label={t('admin.plans.pts_activation')} name="pts_activation"   value={form.config.pts_activation}   onChange={setCfg} />
            </AdminFormGrid>
            <div className="mt-3">
              <AdminNumberField label={t('admin.plans.seuil_conversion')} name="seuil_conversion_pts" value={form.config.seuil_conversion_pts} onChange={setCfg} />
            </div>
          </AdminFormSection>

          <AdminFormSection title={t('admin.plans.section_fonctionnalites')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <AdminToggle label="Photos VIP"       name="photos_vip"       value={form.config.photos_vip}       onChange={setCfg} />
              <AdminToggle label="Facture WhatsApp" name="facture_whatsapp" value={form.config.facture_whatsapp} onChange={setCfg} />
              <AdminToggle label="Sauvegarde auto"  name="sauvegarde_auto"  value={form.config.sauvegarde_auto}  onChange={setCfg} />
              <AdminToggle label="Module caisse"    name="module_caisse"    value={form.config.module_caisse}    onChange={setCfg} />
              <AdminToggle label="Multi-ateliers"   name="multi_ateliers"   value={form.config.multi_ateliers}   onChange={setCfg} />
              <AdminToggle label="Export PDF"       name="export_pdf"       value={form.config.export_pdf}       onChange={setCfg} />
            </div>
          </AdminFormSection>
        </div>

        {/* Pleine largeur : longueur imprévisible (référentiel serveur +
            clés ajoutées à la volée), un forçage en 2 colonnes casserait
            la lisibilité dès qu'elle dépasse quelques entrées. */}
        <div className="lg:col-span-2">
          {/* S02A-28b : les clés qui n'ont pas de champ dédié étaient affichées
              en BRUT (« max_photos_vetement »), sans libellé ni type, et la
              liste dérivait à chaque migration. Elles sont maintenant rendues
              depuis le référentiel serveur, avec leur vrai libellé et le bon
              type de champ. Toute clé ajoutée par une future migration
              apparaît ici sans retoucher cet écran. */}
          <AdminFormSection title={t('admin.plans.section_avancee')}>
            {referentiel
              .filter(f => !KNOWN_KEYS.includes(f.cle))
              .map(f => (
                f.type === 'booleen'
                  ? <AdminToggle key={f.cle} label={f.label} name={f.cle}
                            value={form.config[f.cle] ?? false} onChange={setCfg} />
                  : f.type === 'numerique'
                    ? <div key={f.cle} className="mb-2">
                        <AdminNumberField label={f.unite ? `${f.label} (${f.unite})` : f.label}
                                  name={f.cle} value={form.config[f.cle] ?? 0}
                                  onChange={setCfg} unlimited hint={f.description} />
                      </div>
                    : <div key={f.cle} className="mb-2">
                        <AdminField label={f.label} value={String(form.config[f.cle] ?? '')}
                               onChange={e => setCfg(f.cle, parseConfigVal(e.target.value))} />
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
                <input value={String(form.config[k] ?? '')} onChange={e => setCfg(k, parseConfigVal(e.target.value))} className={ADMIN_INPUT + ' max-w-[160px]'} />
                <button type="button" onClick={() => removeCfg(k)} className="text-ghost hover:text-danger text-sm px-1" title={t('commun.retirer')}><X size={13} aria-hidden="true" /></button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="nouvelle_cle" className={ADMIN_INPUT + ' max-w-[200px]'} />
              <button type="button" onClick={addKey} className="text-sm font-medium text-primary whitespace-nowrap">+ Ajouter</button>
            </div>
          </AdminFormSection>
        </div>
      </form>
    </AdminModal>
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
    // Au-delà de 1000 jours, le plan est « permanent » (convention serveur) :
    // afficher « 32000 j » n'apprend rien et donne l'impression d'une erreur.
    { key: 'duree_jours', label: t('admin.plans.col_duree'),
      render: r => (Number(r.duree_jours) >= 1000 ? t('admin.plans.duree_permanente') : `${r.duree_jours} j`) },
    { key: 'type_compte', label: t('admin.plans.col_type'),
      render: r => t(`admin.plans.type_${r.type_compte || 'tous'}`) },
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
