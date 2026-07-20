import { useEffect, useState } from 'react'
import { Check, Plus, X, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AdminLayout } from '@/components/admin'
import {
  useSplashThemes, useSetSplashThemes,
  useIdentiteLegale, useSetIdentiteLegale,
  useModerationAvis, useSetModerationAvis,
  useCompteRebours, useSetCompteRebours,
} from '@/hooks/admin/useReglagesVitrine'

/**
 * Réglages vitrine pilotés par la direction.
 *
 * TROIS jeux de valeurs existaient côté serveur SANS aucun écran pour les
 * atteindre : les périodes saisonnières et l'identité légale n'avaient qu'une
 * route d'écriture, la modération des avis n'était reliée à rien. La direction
 * devait passer par un développeur pour changer une date d'entrée en vigueur,
 * activer un habillage de Noël ou bannir un mot — exactement ce que la
 * configuration éditable cherche à éviter.
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

  // AV2-F4 — réglages de modération des avis. Le backend existait depuis le
  // 20/07 ; sans cet écran la direction ne pouvait ni relire ni ajuster les
  // seuils, et devait passer par un développeur pour bannir un mot.
  const modQ = useModerationAvis()
  const setMod = useSetModerationAvis()
  const [mod, setLocalMod] = useState({
    max_avis_par_jour: 5, seuil_signalements: 3, motifs_graves: [], mots_bannis: [],
  })
  const [modSaved, setModSaved] = useState(false)

  // CLI-3 — compte à rebours de lancement, réutilisable pour toute annonce
  // datée : la direction change la date et les textes sans redéploiement.
  const reboursQ = useCompteRebours()
  const setRebours = useSetCompteRebours()
  const [rebours, setLocalRebours] = useState({
    actif: false, date_cible: '', jours_avant: 30, titre: '',
    texte_bande: '', texte_jour_j: '', couleur: '#D00B0B',
    lien: '', chrono_jour_j: true,
  })
  const [reboursSaved, setReboursSaved] = useState(false)

  useEffect(() => { if (themesQ.data) setLocalThemes(themesQ.data) }, [themesQ.data])
  useEffect(() => { if (legalQ.data) setLocalLegal((v) => ({ ...v, ...legalQ.data })) }, [legalQ.data])
  useEffect(() => { if (modQ.data) setLocalMod((v) => ({ ...v, ...modQ.data })) }, [modQ.data])
  useEffect(() => {
    // `lien` revient à null quand il n'est pas renseigné ; un `null` dans un
    // input le rendrait non contrôlé et React s'en plaindrait à la frappe.
    if (reboursQ.data) setLocalRebours((v) => ({ ...v, ...reboursQ.data, lien: reboursQ.data.lien ?? '' }))
  }, [reboursQ.data])

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

  const enregistrerMod = async (e) => {
    e.preventDefault()
    // Le serveur attend des tableaux ; la saisie se fait en texte libre (une
    // entrée par ligne), plus commode qu'une liste de champs à cliquer.
    await setMod.mutateAsync({
      ...mod,
      max_avis_par_jour: Number(mod.max_avis_par_jour) || 1,
      seuil_signalements: Number(mod.seuil_signalements) || 1,
      motifs_graves: (mod.motifs_graves ?? []).filter(Boolean),
      mots_bannis: (mod.mots_bannis ?? []).filter(Boolean),
    })
    setModSaved(true)
    setTimeout(() => setModSaved(false), 1600)
  }

  const enregistrerRebours = async (e) => {
    e.preventDefault()
    await setRebours.mutateAsync({
      ...rebours,
      jours_avant: Number(rebours.jours_avant) || 30,
      // Le serveur valide `present, nullable` : une chaîne vide doit repartir
      // en null, sinon on enregistre un lien « rien » que le front affichera.
      lien: rebours.lien?.trim() ? rebours.lien.trim() : null,
    })
    setReboursSaved(true)
    setTimeout(() => setReboursSaved(false), 1600)
  }

  const lignesVersTableau = (v) =>
    v.split('\n').map((x) => x.trim()).filter(Boolean)

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
        {/* ── CLI-3 : compte à rebours de lancement ─────────────────────── */}
        <form onSubmit={enregistrerRebours} className="bg-card border border-edge rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h2 className="text-sm font-semibold text-ink">{t('admin.compte_rebours.titre')}</h2>
            {reboursSaved && (
              <span className="text-xs text-success font-medium inline-flex items-center gap-1">
                <Check size={12} aria-hidden="true" />{t('commun.enregistre')}
              </span>
            )}
          </div>
          <p className="text-xs text-dim leading-relaxed mb-4">{t('admin.compte_rebours.aide')}</p>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={!!rebours.actif}
                   onChange={(e) => setLocalRebours((v) => ({ ...v, actif: e.target.checked }))} />
            {t('admin.compte_rebours.actif')}
          </label>

          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <div>
              <span className={LABEL}>{t('admin.compte_rebours.date_cible')}</span>
              <input type="datetime-local" className={INPUT}
                     value={(rebours.date_cible ?? '').replace(' ', 'T')}
                     onChange={(e) => setLocalRebours((v) => ({ ...v, date_cible: e.target.value.replace('T', ' ').slice(0, 16) }))} />
            </div>
            <div>
              <span className={LABEL}>{t('admin.compte_rebours.jours_avant')}</span>
              <input type="number" min={1} max={365} className={INPUT} value={rebours.jours_avant ?? 30}
                     onChange={(e) => setLocalRebours((v) => ({ ...v, jours_avant: e.target.value }))} />
            </div>
          </div>

          <div className="mt-3">
            <span className={LABEL}>{t('admin.compte_rebours.entete')}</span>
            <input className={INPUT} maxLength={80} value={rebours.titre ?? ''}
                   onChange={(e) => setLocalRebours((v) => ({ ...v, titre: e.target.value }))} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <div>
              <span className={LABEL}>{t('admin.compte_rebours.texte_bande')}</span>
              <input className={INPUT} maxLength={160} value={rebours.texte_bande ?? ''}
                     onChange={(e) => setLocalRebours((v) => ({ ...v, texte_bande: e.target.value }))} />
            </div>
            <div>
              <span className={LABEL}>{t('admin.compte_rebours.texte_jour_j')}</span>
              <input className={INPUT} maxLength={160} value={rebours.texte_jour_j ?? ''}
                     onChange={(e) => setLocalRebours((v) => ({ ...v, texte_jour_j: e.target.value }))} />
            </div>
          </div>
          <p className="text-[11px] text-ghost mt-1">{t('admin.compte_rebours.marqueurs')}</p>

          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <div>
              <span className={LABEL}>{t('admin.compte_rebours.couleur')}</span>
              <input type="color" className={INPUT + ' h-10 p-1'} value={rebours.couleur || '#D00B0B'}
                     onChange={(e) => setLocalRebours((v) => ({ ...v, couleur: e.target.value }))} />
            </div>
            <div>
              <span className={LABEL}>{t('admin.compte_rebours.lien')}</span>
              <input className={INPUT} maxLength={300} value={rebours.lien ?? ''}
                     onChange={(e) => setLocalRebours((v) => ({ ...v, lien: e.target.value }))} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink mt-4">
            <input type="checkbox" checked={!!rebours.chrono_jour_j}
                   onChange={(e) => setLocalRebours((v) => ({ ...v, chrono_jour_j: e.target.checked }))} />
            {t('admin.compte_rebours.chrono')}
          </label>

          <button type="submit" disabled={setRebours.isPending}
                  className="mt-4 rounded-xl bg-primary text-inverse text-sm font-semibold px-5 py-2 disabled:opacity-50">
            {t('commun.enregistrer')}
          </button>
        </form>

        {/* ── AV2-F4 : modération des avis ──────────────────────────────── */}
        <form onSubmit={enregistrerMod} className="bg-card border border-edge rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h2 className="text-sm font-semibold text-ink">{t('admin.moderation_avis.titre')}</h2>
            {modSaved && (
              <span className="text-xs text-success font-medium inline-flex items-center gap-1">
                <Check size={12} aria-hidden="true" />{t('commun.enregistre')}
              </span>
            )}
          </div>
          <p className="text-xs text-dim leading-relaxed mb-4">{t('admin.moderation_avis.aide')}</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <span className={LABEL}>{t('admin.moderation_avis.max_jour')}</span>
              <input type="number" min={1} max={100} className={INPUT}
                     value={mod.max_avis_par_jour ?? 5}
                     onChange={(e) => setLocalMod((v) => ({ ...v, max_avis_par_jour: e.target.value }))} />
              <p className="text-[11px] text-ghost mt-1">{t('admin.moderation_avis.max_jour_aide')}</p>
            </div>
            <div>
              <span className={LABEL}>{t('admin.moderation_avis.seuil')}</span>
              <input type="number" min={1} max={100} className={INPUT}
                     value={mod.seuil_signalements ?? 3}
                     onChange={(e) => setLocalMod((v) => ({ ...v, seuil_signalements: e.target.value }))} />
              <p className="text-[11px] text-ghost mt-1">{t('admin.moderation_avis.seuil_aide')}</p>
            </div>
          </div>

          <div className="mt-4">
            <span className={LABEL}>{t('admin.moderation_avis.motifs')}</span>
            <textarea className={INPUT + ' resize-none font-mono text-[13px]'} rows={3}
                      value={(mod.motifs_graves ?? []).join('\n')}
                      onChange={(e) => setLocalMod((v) => ({ ...v, motifs_graves: lignesVersTableau(e.target.value) }))} />
            <p className="text-[11px] text-ghost mt-1">{t('admin.moderation_avis.motifs_aide')}</p>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className={LABEL}>{t('admin.moderation_avis.mots')}</span>
              <span className="text-[11px] text-ghost">
                {t('admin.moderation_avis.mots_compte', { count: (mod.mots_bannis ?? []).length })}
              </span>
            </div>
            <textarea className={INPUT + ' resize-none font-mono text-[13px]'} rows={6}
                      value={(mod.mots_bannis ?? []).join('\n')}
                      onChange={(e) => setLocalMod((v) => ({ ...v, mots_bannis: lignesVersTableau(e.target.value) }))} />
            <p className="text-[11px] text-ghost mt-1">{t('admin.moderation_avis.mots_aide')}</p>
          </div>

          <button type="submit" disabled={setMod.isPending}
                  className="mt-4 rounded-xl bg-primary text-inverse text-sm font-semibold px-5 py-2 disabled:opacity-50">
            {t('commun.enregistrer')}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
