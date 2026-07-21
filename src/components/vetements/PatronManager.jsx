import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Upload, Trash2, Tag } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { patronService } from '@/services/patronService'
import { useDeviseAtelier } from '@/utils/formatCurrency'

// P161-163 (créateur) : met en vente / retire le patron payant d'une création.
export default function PatronManager({ vetement }) {
  const { t } = useTranslation()
  const { symbole: devise, format: formatCurrency } = useDeviseAtelier()
  const [patron, setPatron] = useState(undefined) // undefined = chargement, null = aucun
  const [titre, setTitre] = useState('')
  const [prix, setPrix] = useState('')
  const [fichier, setFichier] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const charger = async () => {
    try {
      const list = await patronService.getAll()
      setPatron((Array.isArray(list) ? list : []).find(p => p.vetement_id === vetement.id) ?? null)
    } catch {
      setPatron(null)
    }
  }

  useEffect(() => { charger() }, [vetement.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const publier = async () => {
    setError('')
    if (!fichier) { setError(t('patron.err_fichier')); return }
    if (!prix || Number(prix) < 100) { setError(t('patron.err_prix', { devise })); return }
    setBusy(true)
    try {
      await patronService.create({
        vetement_id: vetement.id,
        titre: titre.trim() || vetement.nom,
        prix: Number(prix),
        fichier,
      })
      setTitre(''); setPrix(''); setFichier(null)
      await charger()
    } catch (e) {
      setError(e?.response?.data?.message || t('patron.err_generic'))
    } finally {
      setBusy(false)
    }
  }

  const retirer = async () => {
    if (!patron || !window.confirm(t('patron.retirer_confirm'))) return
    setBusy(true)
    try {
      await patronService.remove(patron.id)
      await charger()
    } finally {
      setBusy(false)
    }
  }

  if (patron === undefined) return null

  return (
    <div className="border-t border-edge pt-4 mt-1 space-y-3">
      <div className="flex items-center gap-2">
        <Tag size={15} className="text-primary" />
        <p className="text-sm font-semibold text-ink">{t('patron.section_title')}</p>
      </div>

      {patron ? (
        <div className="bg-subtle border border-edge rounded-xl p-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink truncate">{patron.titre}</p>
              <p className="text-xs text-ghost truncate">{patron.fichier_nom}</p>
            </div>
            <span className="text-sm font-bold text-primary shrink-0">{formatCurrency(patron.prix)}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-ghost">{t('patron.ventes', { n: patron.ventes ?? 0 })}</span>
            <button type="button" onClick={retirer} disabled={busy}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-error hover:opacity-80 transition disabled:opacity-50">
              <Trash2 size={13} />{t('patron.retirer')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          <p className="text-xs text-ghost">{t('patron.hint')}</p>
          <Input label={t('patron.titre_label')} value={titre} onChange={e => setTitre(e.target.value)} placeholder={vetement.nom} />
          <Input label={t('patron.prix_label', { devise })} type="number" min="100" value={prix} onChange={e => setPrix(e.target.value)} placeholder="5000" />
          <label className="flex items-center gap-2 w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-edge text-ghost hover:border-primary hover:text-primary transition cursor-pointer text-sm">
            <Upload size={16} />
            <span className="truncate">{fichier ? fichier.name : t('patron.fichier_label')}</span>
            <input type="file" accept=".pdf,.zip,.png,.jpg,.jpeg" className="hidden"
                   onChange={e => setFichier(e.target.files?.[0] ?? null)} />
          </label>
          {error && <p className="text-xs text-error">{error}</p>}
          <Button type="button" onClick={publier} loading={busy} className="w-full" variant="secondary">
            {t('patron.publier')}
          </Button>
        </div>
      )}
    </div>
  )
}
