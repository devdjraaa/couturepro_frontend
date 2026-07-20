import { useEffect, useState } from 'react'
import { Check, Plus, X, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AdminLayout } from '@/components/admin'
import {
  useSplashThemes, useSetSplashThemes,
  useIdentiteLegale, useSetIdentiteLegale,
} from '@/hooks/admin/useReglagesVitrine'

/**
 * Réglages vitrine pilotés par la direction.
 *
 * Ces deux jeux de valeurs existaient côté serveur SANS aucun écran : les
 * périodes saisonnières et l'identité légale n'avaient qu'une route d'écriture,
 * inatteignable depuis le back-office. La direction devait donc passer par un
 * développeur pour changer une date d'entrée en vigueur ou activer un habillage
 * de Noël — exactement ce que la configuration éditable cherche à éviter.
 */

const INPUT = 'w-full border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card mt-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
const LABEL = 'text-xs text-ghost'

/** Deux périodes qui se recouvrent : le serveur retient la PREMIÈRE trouvée. */
function chevauche(themes, i) {
  const a = themes[i]
  if (!a?.date_debut || !a?.date_fin) return false

  return themes.some((b, j) => j !== i && b.date_debut && b.date_fin
    && a.date_debut <= b.date_fin && b.date_debut <= a.date_fin)
}

export default function ReglagesVitrinePage() {
  const { t } = useTranslation()
  const T = (c) => t(`admin.reglages_vitrine.${c}`)

  const themesQ = useSplashThemes()
  const setThemes = useSetSplashThemes()
  const [themes, setLocalThemes] = useState([])
  const [themesSaved, setThemesSaved] = useState(false)

  const legalQ = useIdentiteLegale()
  const setLegal = useSetIdentiteLegale()
  const [legal, setLocalLegal] = useState({
    rccm: '', ifu: '', apdp_deliberation: '', date_entree_vigueur: '', date_maj: '',
  })
  const [legalSaved, setLegalSaved] = useState(false)

  useEffect(() => { if (themesQ.data) setLocalThemes(themesQ.data) }, [themesQ.data])
  useEffect(() => { if (legalQ.data) setLocalLegal((v) => ({ ...v, ...legalQ.data })) }, [legalQ.data])

  const majTheme = (i, cle, val) =>
    setLocalThemes((l) => l.map((th, idx) => (idx === i ? { ...th, [cle]: val } : th)))

  const ajouterTheme = () => setLocalThemes((l) => [...l, {
    nom: '', actif: false, image_url: '', texte: '',
    date_debut: new Date().toISOString().slice(0, 10),
    date_fin: new Date().toISOString().slice(0, 10),
  }])

  const retirerTheme = (i) => setLocalThemes((l) => l.filter((_, idx) => idx !== i))

  const enregistrerThemes = async (e) => {
    e.preventDefault()
    await setThemes.mutateAsync(themes)
    setThemesSaved(true)
    setTimeout(() => setThemesSaved(false), 1600)
  }

  const enregistrerLegal = async (e) => {
    e.preventDefault()
    await setLegal.mutateAsync(legal)
    setLegalSaved(true)
    setTimeout(() => setLegalSaved(false), 1600)
  }

  return (
    <AdminLayout title={T('titre')}>
      <div className="max-w-3xl space-y-8">

        {/* ── Habillage saisonnier de l'ouverture ───────────────────────── */}
        <form onSubmit={enregistrerThemes} className="bg-card border border-edge rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h2 className="text-sm font-semibold text-ink">{T('splash_titre')}</h2>
            {themesSaved && (
              <span className="text-xs text-success font-medium inline-flex items-center gap-1">
                <Check size={12} aria-hidden="true" />{t('commun.enregistre')}
              </span>
            )}
          </div>
          <p className="text-xs text-dim leading-relaxed mb-4">{T('splash_aide')}</p>

          <div className="space-y-4">
            {themes.length === 0 && (
              <p className="text-sm text-ghost py-3">{T('splash_vide')}</p>
            )}

            {themes.map((th, i) => (
              <div key={i} className="border border-edge rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <input type="checkbox" checked={!!th.actif}
                           onChange={(e) => majTheme(i, 'actif', e.target.checked)} />
                    {T('splash_actif')}
                  </label>
                  <button type="button" onClick={() => retirerTheme(i)}
                          className="text-ghost hover:text-danger" aria-label={t('commun.retirer')}>
                    <X size={15} aria-hidden="true" />
                  </button>
                </div>

                <div>
                  <span className={LABEL}>{T('splash_nom')}</span>
                  <input className={INPUT} maxLength={60} value={th.nom ?? ''}
                         onChange={(e) => majTheme(i, 'nom', e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className={LABEL}>{T('splash_debut')}</span>
                    <input type="date" className={INPUT} value={th.date_debut ?? ''}
                           onChange={(e) => majTheme(i, 'date_debut', e.target.value)} />
                  </div>
                  <div>
                    <span className={LABEL}>{T('splash_fin')}</span>
                    <input type="date" className={INPUT} value={th.date_fin ?? ''}
                           onChange={(e) => majTheme(i, 'date_fin', e.target.value)} />
                  </div>
                </div>

                <div>
                  <span className={LABEL}>{T('splash_texte')}</span>
                  <input className={INPUT} maxLength={150} value={th.texte ?? ''}
                         onChange={(e) => majTheme(i, 'texte', e.target.value)} />
                </div>

                <div>
                  <span className={LABEL}>{T('splash_image')}</span>
                  <input className={INPUT} maxLength={500} value={th.image_url ?? ''}
                         onChange={(e) => majTheme(i, 'image_url', e.target.value)} />
                </div>

                {chevauche(themes, i) && (
                  <p className="flex items-start gap-2 text-xs text-warning">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
                    {T('chevauchement')}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button type="button" onClick={ajouterTheme}
                    className="inline-flex items-center gap-1.5 text-sm text-primary font-medium">
              <Plus size={14} aria-hidden="true" />{T('splash_ajouter')}
            </button>
            <button type="submit" disabled={setThemes.isPending}
                    className="ml-auto rounded-xl bg-primary text-inverse text-sm font-semibold px-5 py-2 disabled:opacity-50">
              {t('commun.enregistrer')}
            </button>
          </div>
        </form>

        {/* ── Identité légale ───────────────────────────────────────────── */}
        <form onSubmit={enregistrerLegal} className="bg-card border border-edge rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h2 className="text-sm font-semibold text-ink">{T('legal_titre')}</h2>
            {legalSaved && (
              <span className="text-xs text-success font-medium inline-flex items-center gap-1">
                <Check size={12} aria-hidden="true" />{t('commun.enregistre')}
              </span>
            )}
          </div>
          <p className="text-xs text-dim leading-relaxed mb-4">{T('legal_aide')}</p>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              ['rccm', 'legal_rccm', 60],
              ['ifu', 'legal_ifu', 60],
              ['apdp_deliberation', 'legal_apdp', 80],
              ['date_entree_vigueur', 'legal_vigueur', 40],
              ['date_maj', 'legal_maj', 40],
            ].map(([cle, libelle, max]) => (
              <div key={cle}>
                <span className={LABEL}>{T(libelle)}</span>
                <input className={INPUT} maxLength={max} value={legal[cle] ?? ''}
                       onChange={(e) => setLocalLegal((v) => ({ ...v, [cle]: e.target.value }))} />
              </div>
            ))}
          </div>

          <button type="submit" disabled={setLegal.isPending}
                  className="mt-4 rounded-xl bg-primary text-inverse text-sm font-semibold px-5 py-2 disabled:opacity-50">
            {t('commun.enregistrer')}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
