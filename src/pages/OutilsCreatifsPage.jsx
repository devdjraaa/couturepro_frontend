import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Pencil, Trash2, Plus, X, Eye, EyeOff, ImagePlus, Share2,
  PenTool, FileText, Scissors, Palette, Download, ShoppingBag,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/components/layout'
import { TabBar, Button, EmptyState, Skeleton } from '@/components/ui'
import { creationDesignerService } from '@/services/creationDesignerService'
import { shareToInstagram } from '@/utils/shareInstagram'
import { exportFicheTechniquePdf } from '@/utils/exportFicheTechniquePdf'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts'
import { cn } from '@/utils/cn'

const CATEGORIES = ['croquis', 'fiche_technique', 'patron', 'moodboard']

const EMPTY_FORM = { titre: '', description: '', categorie: 'croquis', public: false, images: [], metadata: {} }

// Chaque onglet est un OUTIL distinct : champs structurés propres à sa catégorie
// (stockés dans metadata) + rendu et état vide dédiés.
const CATEGORY_ICON = { croquis: PenTool, fiche_technique: FileText, patron: Scissors, moodboard: Palette }

const META_FIELDS = {
  croquis: [],
  fiche_technique: [
    { key: 'tissu', type: 'text' },
    { key: 'fournitures', type: 'text' },
    { key: 'cout_matiere', type: 'text', inputMode: 'numeric' },
    { key: 'temps_confection', type: 'text' },
    { key: 'taille_base', type: 'text' },
    { key: 'instructions', type: 'textarea' },
  ],
  patron: [
    { key: 'tailles', type: 'text' },
    { key: 'niveau', type: 'select', options: ['debutant', 'intermediaire', 'avance'] },
    { key: 'nb_pieces', type: 'text', inputMode: 'numeric' },
  ],
  moodboard: [
    { key: 'palette', type: 'text' },
    { key: 'inspiration', type: 'text' },
  ],
}

// Pastilles de couleur si la palette contient des codes hex (#a1b2c3).
const parsePalette = (palette) => (palette?.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g) ?? []).slice(0, 8)

const imageUrl = (path) => (path ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${path}` : null)

function MetaLigne({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-edge pb-1.5">
      <span className="text-xs text-dim">{label}</span>
      <span className="text-xs font-medium text-ink text-right">{value}</span>
    </div>
  )
}

function CreationCard({ item, onEdit, onDelete, onShare, onVendre, onPdf, t }) {
  const imgUrl = imageUrl(item.images?.[0])
  const meta = item.metadata ?? {}
  const cat = item.categorie

  return (
    <div className="bg-card border border-edge rounded-xl overflow-hidden">
      {/* Visuel : croquis en grand, moodboard en collage, autres en bandeau */}
      {cat === 'moodboard' && item.images?.length > 1 ? (
        <div className="grid grid-cols-2 gap-0.5">
          {item.images.slice(0, 4).map((img, i) => (
            <img key={i} src={imageUrl(img)} alt={item.titre} className="w-full h-24 object-cover" />
          ))}
        </div>
      ) : imgUrl && cat !== 'fiche_technique' ? (
        <img src={imgUrl} alt={item.titre} className={cn('w-full object-cover', cat === 'croquis' ? 'h-56' : 'h-40')} />
      ) : null}

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-ink truncate">{item.titre}</h3>
          <span className={cn('text-2xs px-2 py-0.5 rounded-full shrink-0', item.public ? 'bg-success/10 text-success' : 'bg-subtle text-ghost')}>
            {item.public ? <Eye size={12} className="inline mr-1" /> : <EyeOff size={12} className="inline mr-1" />}
            {t(`outils_creatifs.${cat}`)}
          </span>
        </div>
        {item.description && <p className="text-xs text-dim line-clamp-2">{item.description}</p>}

        {/* Fiche technique : bloc structuré */}
        {cat === 'fiche_technique' && (
          <div className="space-y-1.5 pt-1">
            {META_FIELDS.fiche_technique.filter(f => f.key !== 'instructions' && meta[f.key]).map(f => (
              <MetaLigne key={f.key} label={t(`outils_creatifs.meta.${f.key}`)} value={meta[f.key]} />
            ))}
            {meta.instructions && (
              <p className="text-xs text-dim bg-subtle rounded-lg px-2.5 py-2 whitespace-pre-wrap line-clamp-4">{meta.instructions}</p>
            )}
          </div>
        )}

        {/* Patron : badges tailles / niveau / pièces */}
        {cat === 'patron' && (meta.tailles || meta.niveau || meta.nb_pieces) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {meta.tailles && <span className="text-2xs px-2 py-0.5 rounded-full bg-subtle text-ink">{t('outils_creatifs.meta.tailles')} {meta.tailles}</span>}
            {meta.niveau && <span className="text-2xs px-2 py-0.5 rounded-full bg-subtle text-ink">{t(`outils_creatifs.niveaux.${meta.niveau}`)}</span>}
            {meta.nb_pieces && <span className="text-2xs px-2 py-0.5 rounded-full bg-subtle text-ink">{meta.nb_pieces} {t('outils_creatifs.meta.pieces')}</span>}
          </div>
        )}

        {/* Moodboard : pastilles de palette + source d'inspiration */}
        {cat === 'moodboard' && (
          <div className="space-y-1.5 pt-1">
            {parsePalette(meta.palette).length > 0 && (
              <div className="flex items-center gap-1.5">
                {parsePalette(meta.palette).map(hex => (
                  <span key={hex} title={hex} className="w-5 h-5 rounded-full border border-edge" style={{ backgroundColor: hex }} />
                ))}
              </div>
            )}
            {meta.palette && parsePalette(meta.palette).length === 0 && (
              <MetaLigne label={t('outils_creatifs.meta.palette')} value={meta.palette} />
            )}
            {meta.inspiration && <MetaLigne label={t('outils_creatifs.meta.inspiration')} value={meta.inspiration} />}
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t border-edge">
          <button onClick={() => onEdit(item)} className="text-xs text-primary flex items-center gap-1">
            <Pencil size={12} /> {t('outils_creatifs.modifier')}
          </button>
          {cat === 'fiche_technique' && (
            <button onClick={() => onPdf(item, imgUrl)} className="text-xs text-accent flex items-center gap-1">
              <Download size={12} /> PDF
            </button>
          )}
          {cat === 'patron' && (
            <button onClick={() => onVendre(item)} className="text-xs text-accent flex items-center gap-1">
              <ShoppingBag size={12} /> {t('outils_creatifs.vendre')}
            </button>
          )}
          {imgUrl && cat !== 'fiche_technique' && cat !== 'patron' && (
            <button onClick={() => onShare(item, imgUrl)} className="text-xs text-accent flex items-center gap-1">
              <Share2 size={12} /> {t('outils_creatifs.partager')}
            </button>
          )}
          <button onClick={() => onDelete(item)} className="text-xs text-danger flex items-center gap-1 ml-auto">
            <Trash2 size={12} /> {t('outils_creatifs.supprimer')}
          </button>
        </div>
      </div>
    </div>
  )
}

function CreationForm({ initial, onSave, onCancel, t }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target ? e.target.value : e }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, images: files.length ? files : undefined }
      if (initial?.id) {
        await creationDesignerService.update(initial.id, payload)
      } else {
        await creationDesignerService.create(payload)
      }
      onSave()
    } catch {
      // Ne pas échouer en silence : l'utilisateur doit savoir que ça n'a pas marché.
      toast.error(t('outils_creatifs.erreur'))
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-edge rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-ink">
          {initial?.id ? t('outils_creatifs.modifier') : t('outils_creatifs.ajouter')}
        </h3>
        <button type="button" onClick={onCancel}><X size={18} className="text-ghost" /></button>
      </div>

      <select
        value={form.categorie}
        onChange={set('categorie')}
        className="w-full rounded-xl border border-edge bg-card px-3 py-2 text-sm text-ink"
      >
        {CATEGORIES.map(c => (
          <option key={c} value={c}>{t(`outils_creatifs.${c}`)}</option>
        ))}
      </select>

      <input
        value={form.titre} onChange={set('titre')} required
        placeholder={t('outils_creatifs.titre_label')}
        className="w-full rounded-xl border border-edge bg-card px-3 py-2 text-sm text-ink"
      />

      <textarea
        value={form.description} onChange={set('description')}
        placeholder={t('outils_creatifs.description_label')}
        rows={3}
        className="w-full rounded-xl border border-edge bg-card px-3 py-2 text-sm text-ink resize-none"
      />

      {/* Champs structurés propres à la catégorie (metadata) */}
      {META_FIELDS[form.categorie]?.map(f => {
        const val = form.metadata?.[f.key] ?? ''
        const setMeta = (e) => setForm(prev => ({ ...prev, metadata: { ...prev.metadata, [f.key]: e.target.value } }))
        const ph = t(`outils_creatifs.meta.${f.key}`)
        if (f.type === 'textarea') {
          return (
            <textarea key={f.key} value={val} onChange={setMeta} placeholder={ph} rows={4}
              className="w-full rounded-xl border border-edge bg-card px-3 py-2 text-sm text-ink resize-none" />
          )
        }
        if (f.type === 'select') {
          return (
            <select key={f.key} value={val} onChange={setMeta}
              className="w-full rounded-xl border border-edge bg-card px-3 py-2 text-sm text-ink">
              <option value="">{ph}</option>
              {f.options.map(o => <option key={o} value={o}>{t(`outils_creatifs.niveaux.${o}`)}</option>)}
            </select>
          )
        }
        return (
          <input key={f.key} value={val} onChange={setMeta} placeholder={ph} inputMode={f.inputMode}
            className="w-full rounded-xl border border-edge bg-card px-3 py-2 text-sm text-ink" />
        )
      })}
      {form.categorie === 'moodboard' && (
        <p className="text-2xs text-ghost -mt-1">{t('outils_creatifs.meta.palette_aide')}</p>
      )}

      <div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 text-sm text-primary font-medium"
        >
          <ImagePlus size={16} /> {t('outils_creatifs.images_label')}
        </button>
        <input
          ref={fileRef} type="file" accept="image/*,.pdf" multiple hidden
          onChange={(e) => setFiles([...e.target.files])}
        />
        {files.length > 0 && (
          <p className="text-xs text-dim mt-1">{files.length} fichier(s)</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
        <input
          type="checkbox" checked={form.public}
          onChange={(e) => setForm(f => ({ ...f, public: e.target.checked }))}
        />
        {t('outils_creatifs.public_label')}
      </label>

      <Button type="submit" loading={saving} className="w-full">
        {t('outils_creatifs.enregistrer')}
      </Button>
    </form>
  )
}

export default function OutilsCreatifsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { atelier } = useAuth()
  const [items, setItems] = useState(null)
  const [filter, setFilter] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    try {
      const data = await creationDesignerService.list(filter)
      setItems(data)
    } catch { setItems([]) }
  }

  useEffect(() => { load() }, [filter])

  const tabs = [
    { key: 'tous', label: t('outils_creatifs.tous') },
    ...CATEGORIES.map(c => ({ key: c, label: t(`outils_creatifs.${c}`) })),
  ]

  const handleDelete = async (item) => {
    if (!window.confirm(t('outils_creatifs.confirmer_suppression'))) return
    try {
      await creationDesignerService.remove(item.id)
      load()
    } catch { /* silencieux */ }
  }

  const handleShare = (item, imgUrl) => {
    shareToInstagram({
      imageUrl: imgUrl,
      text: `${item.titre} — ${atelier?.nom || 'GEXTIMO'}`,
      instagramHandle: atelier?.instagram,
    })
  }

  // Fiche technique → PDF structuré aux couleurs de l'atelier.
  const handlePdf = async (item, imgUrl) => {
    const labels = {
      titre_doc: t('outils_creatifs.fiche_technique'),
      instructions: t('outils_creatifs.meta.instructions'),
      ...Object.fromEntries(META_FIELDS.fiche_technique.map(f => [f.key, t(`outils_creatifs.meta.${f.key}`)])),
    }
    try {
      await exportFicheTechniquePdf(item, labels, atelier?.nom, imgUrl)
    } catch {
      toast.error(t('outils_creatifs.erreur'))
    }
  }

  // Patron → vente : les patrons payants s'attachent à une création du catalogue.
  const handleVendre = () => {
    toast(t('outils_creatifs.vendre_aide'))
    navigate(ROUTES.VETEMENTS)
  }

  return (
    <AppLayout title={t('outils_creatifs.titre')}>
      <TabBar
        tabs={tabs}
        activeTab={filter || 'tous'}
        onChange={(k) => setFilter(k === 'tous' ? null : k)}
      />

      <div className="p-4 space-y-4">
        {!showForm && !editing && (
          <Button onClick={() => { setEditing(null); setShowForm(true) }} className="w-full">
            <Plus size={16} className="mr-2" /> {t('outils_creatifs.ajouter')}
          </Button>
        )}

        {(showForm || editing) && (
          <CreationForm
            initial={editing}
            t={t}
            onCancel={() => { setShowForm(false); setEditing(null) }}
            onSave={() => { setShowForm(false); setEditing(null); load() }}
          />
        )}

        {items === null ? (
          <div className="space-y-3">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={filter ? CATEGORY_ICON[filter] : ImagePlus}
            title={filter ? t(`outils_creatifs.vide.${filter}`) : t('outils_creatifs.aucun')}
            description={filter ? t(`outils_creatifs.vide.${filter}_sous`) : t('outils_creatifs.aucun_sous')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map(item => (
              <CreationCard
                key={item.id} item={item} t={t}
                onEdit={(it) => { setEditing(it); setShowForm(false) }}
                onDelete={handleDelete}
                onShare={handleShare}
                onPdf={handlePdf}
                onVendre={handleVendre}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
