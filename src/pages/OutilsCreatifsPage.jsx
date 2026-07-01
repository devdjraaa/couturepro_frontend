import { useState, useEffect, useRef } from 'react'
import { Pencil, Trash2, Plus, X, Eye, EyeOff, ImagePlus, Share2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/components/layout'
import { TabBar, Button, EmptyState, Skeleton } from '@/components/ui'
import { creationDesignerService } from '@/services/creationDesignerService'
import { shareToInstagram } from '@/utils/shareInstagram'
import { useAuth } from '@/contexts'
import { cn } from '@/utils/cn'

const CATEGORIES = ['croquis', 'fiche_technique', 'patron', 'moodboard']

const EMPTY_FORM = { titre: '', description: '', categorie: 'croquis', public: false, images: [] }

function CreationCard({ item, onEdit, onDelete, onShare, t }) {
  const imgUrl = item.images?.[0]
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${item.images[0]}`
    : null

  return (
    <div className="bg-card border border-edge rounded-xl overflow-hidden">
      {imgUrl && (
        <img src={imgUrl} alt={item.titre} className="w-full h-40 object-cover" />
      )}
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-ink truncate">{item.titre}</h3>
          <span className={cn('text-2xs px-2 py-0.5 rounded-full', item.public ? 'bg-success/10 text-success' : 'bg-subtle text-ghost')}>
            {item.public ? <Eye size={12} className="inline mr-1" /> : <EyeOff size={12} className="inline mr-1" />}
            {t(`outils_creatifs.${item.categorie}`)}
          </span>
        </div>
        {item.description && <p className="text-xs text-dim line-clamp-2">{item.description}</p>}
        <div className="flex gap-2 pt-2 border-t border-edge">
          <button onClick={() => onEdit(item)} className="text-xs text-primary flex items-center gap-1">
            <Pencil size={12} /> {t('outils_creatifs.modifier')}
          </button>
          {imgUrl && (
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
      /* silencieux */
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
          <EmptyState message={t('outils_creatifs.aucun')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map(item => (
              <CreationCard
                key={item.id} item={item} t={t}
                onEdit={(it) => { setEditing(it); setShowForm(false) }}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
