import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, X, Share2 } from 'lucide-react'
import { useMesAteliers } from '@/hooks/useMesAteliers'
import { Input, Select, Button } from '@/components/ui'
import Avatar, { AVATAR_PALETTES } from '@/components/ui/Avatar'
import { getClientPhoto, compressToBase64 } from '@/utils/clientPhotoStorage'
import { sanitizePhoneInput } from '@/utils/phoneInput'
import { cn } from '@/utils/cn'

const PROFIL_OPTIONS = [
  { value: 'mixte',   label: 'Mixte'   },
  { value: 'femme',   label: 'Femme'   },
  { value: 'homme',   label: 'Homme'   },
  { value: 'enfant',  label: 'Enfant'  },
]

export default function ClientForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    nom:          initialData?.nom          ?? '',
    prenom:       initialData?.prenom       ?? '',
    telephone:    initialData?.telephone    ?? '',
    type_profil:  initialData?.type_profil  ?? 'mixte',
    notes:        initialData?.notes        ?? '',
    avatar_index: initialData?.avatar_index ?? null,
    partage:      initialData?.partage      ?? false,
  })

  // P77 : l'option « partagé entre ateliers » n'a de sens que pour un compte multi-ateliers.
  const { data: ateliers = [] } = useMesAteliers()
  const multiAteliers = ateliers.length > 1

  const [photoPreview, setPhotoPreview] = useState(() =>
    initialData?.id ? getClientPhoto(initialData.id) : null,
  )
  const [pendingPhoto, setPendingPhoto] = useState(null)
  const fileRef = useRef()

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await compressToBase64(file, 200)
    setPhotoPreview(base64)
    setPendingPhoto(base64)
    setForm(f => ({ ...f, avatar_index: null }))
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    setPendingPhoto('__remove__')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, _photo: pendingPhoto })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      {/* Photo profil */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Profil"
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-inverse rounded-full flex items-center justify-center"
              >
                <X size={11} />
              </button>
            </div>
          ) : form.avatar_index != null ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative"
            >
              <Avatar
                nom={form.prenom || form.nom || '?'}
                avatar_index={form.avatar_index}
                size="xl"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-card border border-edge rounded-full flex items-center justify-center">
                <Camera size={10} className="text-dim" />
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-full border-2 border-dashed border-edge flex flex-col items-center justify-center gap-1 text-ghost hover:border-primary hover:text-primary transition-colors"
            >
              <Camera size={18} />
              <span className="text-[9px] font-medium">Photo</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        {/* Sélecteur avatar (désactivé si photo présente) */}
        <div className={cn('flex-1', photoPreview && 'opacity-40 pointer-events-none')}>
          <p className="text-xs font-medium text-dim mb-1.5">
            {photoPreview ? 'Avatar (désactivé)' : 'Avatar'}
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {AVATAR_PALETTES.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setForm(f => ({ ...f, avatar_index: f.avatar_index === i ? null : i }))}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all',
                  p.bg,
                  form.avatar_index === i ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'opacity-70',
                )}
              >
                {p.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label={t('commun.prenom')} value={form.prenom} onChange={set('prenom')} placeholder={t('clients.formulaire.prenom_placeholder')} autoFocus />
        <Input label={t('commun.nom')} value={form.nom} onChange={set('nom')} placeholder={t('clients.formulaire.nom_placeholder')} required />
      </div>
      <Input
        label="Téléphone"
        type="text"
        inputMode="tel"
        value={form.telephone}
        onChange={(e) => setForm(f => ({ ...f, telephone: sanitizePhoneInput(e.target.value) }))}
        placeholder="ex : +229 97 00 00 00"
        required
      />
      <Select
        label="Profil"
        value={form.type_profil}
        onChange={set('type_profil')}
        options={PROFIL_OPTIONS}
      />
      <Input
        label="Notes"
        value={form.notes}
        onChange={set('notes')}
        placeholder="Remarques optionnelles…"
      />

      {/* P77 : partager la cliente entre tous les ateliers du propriétaire */}
      {multiAteliers && (
        <label className="flex items-start gap-3 cursor-pointer bg-subtle rounded-xl p-3">
          <input
            type="checkbox"
            checked={form.partage}
            onChange={(e) => setForm(f => ({ ...f, partage: e.target.checked }))}
            className="mt-0.5 w-5 h-5 accent-primary shrink-0"
          />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
              <Share2 size={14} /> {t('clients.partage.label')}
            </span>
            <span className="block text-xs text-dim mt-0.5">{t('clients.partage.aide')}</span>
          </span>
        </label>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" loading={isLoading} className="flex-1">
          {initialData ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
