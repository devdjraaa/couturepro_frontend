import { useEffect, useState } from 'react'
import { Check, Loader2, RefreshCw, ExternalLink, AlertTriangle, Share2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AdminLayout, ADMIN_INPUT, ADMIN_LABEL } from '@/components/admin'
import { reseauxAdminService } from '@/services/admin/reseauxAdminService'

/**
 * Suivi des performances de la Page Facebook.
 *
 * La collecte quotidienne et le rapport existaient déjà côté serveur, mais la
 * route qui pose le jeton n'avait aucun écran : brancher une Page demandait un
 * développeur, alors que c'est le geste type que la direction doit faire seule.
 *
 * Le jeton n'est jamais réaffiché — le serveur n'en renvoie que les quatre
 * derniers caractères, de quoi vérifier qu'on a posé le bon sans jamais
 * l'exposer.
 */

export default function AdminReseauxPage() {
  const { t } = useTranslation()
  const T = (c, o) => t(`admin.reseaux.${c}`, o)

  const [statut, setStatut] = useState(null)
  const [form, setForm] = useState({ page_id: '', token: '', actif: true })
  const [envoi, setEnvoi] = useState(false)
  const [message, setMessage] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [rapport, setRapport] = useState(null)
  const [collecte, setCollecte] = useState(false)

  const charger = () => reseauxAdminService.statut().then((s) => {
    setStatut(s)
    setForm((f) => ({ ...f, page_id: s?.facebook?.page_id || '', actif: s?.facebook?.actif ?? true }))
  })

  useEffect(() => { charger() }, [])

  const enregistrer = async (e) => {
    e.preventDefault()
    setEnvoi(true); setErreur(null); setMessage(null)
    try {
      // Le serveur lance une collecte dans la foulée : le jeton est donc validé
      // tout de suite, pas le lendemain matin.
      const r = await reseauxAdminService.configurerFacebook(form)
      setMessage(r?.message || T('enregistre'))
      setForm((f) => ({ ...f, token: '' }))   // on ne garde pas le jeton à l'écran
      await charger()
    } catch (err) {
      setErreur(err?.message || T('echec'))
    } finally { setEnvoi(false) }
  }

  const collecterMaintenant = async () => {
    setCollecte(true); setErreur(null); setMessage(null)
    try {
      const r = await reseauxAdminService.collecter()
      setMessage(r?.message || T('collecte_ok'))
      await charger()
    } catch (err) {
      setErreur(err?.message || T('echec'))
    } finally { setCollecte(false) }
  }

  const voirRapport = async () => {
    setErreur(null)
    try { setRapport(await reseauxAdminService.rapport({ top: 5 })) }
    catch (err) { setErreur(err?.message || T('echec')) }
  }

  const fb = statut?.facebook
  const branche = Boolean(fb?.page_id && fb?.token)

  return (
    <AdminLayout title={T('titre')}>
      <div className="max-w-3xl space-y-8">

        {/* ── Branchement de la Page ─────────────────────────────────────── */}
        <form onSubmit={enregistrer} className="bg-card border border-edge rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Share2 size={16} className="text-info" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-ink">{T('page_titre')}</h2>
          </div>
          <p className="text-xs text-dim leading-relaxed mb-4">{T('page_aide')}</p>

          {/* Le mode d'emploi complet est un document à part : le résumer ici
              donnerait un pavé illisible au-dessus de deux champs. */}
          <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer"
             className="inline-flex items-center gap-1.5 text-xs text-primary font-medium mb-4">
            {T('ouvrir_explorateur')}<ExternalLink size={12} aria-hidden="true" />
          </a>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <span className={ADMIN_LABEL}>{T('page_id')}</span>
              <input className={ADMIN_INPUT} maxLength={50} inputMode="numeric"
                     placeholder="123456789012345" value={form.page_id}
                     onChange={(e) => setForm((f) => ({ ...f, page_id: e.target.value.trim() }))} />
            </div>
            <div>
              <span className={ADMIN_LABEL}>{T('jeton')}</span>
              <input type="password" className={ADMIN_INPUT} maxLength={500} autoComplete="off"
                     placeholder={fb?.token ? T('jeton_pose', { fin: fb.token }) : T('jeton_absent')}
                     value={form.token}
                     onChange={(e) => setForm((f) => ({ ...f, token: e.target.value.trim() }))} />
              <p className="text-[11px] text-ghost mt-1">
                {fb?.token ? T('jeton_pose', { fin: fb.token }) : T('jeton_absent')}
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink mt-3">
            <input type="checkbox" checked={!!form.actif}
                   onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))} />
            {T('actif')}
          </label>

          {fb?.derniere_erreur && (
            <p className="flex items-start gap-2 text-xs text-danger mt-3">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
              {T('derniere_erreur', { message: fb.derniere_erreur })}
            </p>
          )}
          {message && <p className="text-xs text-success mt-3 inline-flex items-center gap-1">
            <Check size={12} aria-hidden="true" />{message}
          </p>}
          {erreur && <p className="text-xs text-danger mt-3">{erreur}</p>}

          <button type="submit" disabled={envoi || !form.page_id || (!form.token && !fb?.token)}
                  className="mt-4 rounded-xl bg-primary text-inverse text-sm font-semibold px-5 py-2 disabled:opacity-50">
            {envoi ? t('commun.chargement') : t('commun.enregistrer')}
          </button>
        </form>

        {/* ── État de la collecte ────────────────────────────────────────── */}
        <div className="bg-card border border-edge rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-ink mb-1">{T('collecte_titre')}</h2>
          <p className="text-xs text-dim leading-relaxed mb-4">{T('collecte_aide')}</p>

          <div className="flex items-center gap-6 text-sm">
            <span className="text-dim">{T('nb_posts', { n: statut?.nb_posts ?? 0 })}</span>
            <span className="text-dim">{T('nb_releves', { n: statut?.nb_releves ?? 0 })}</span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button type="button" onClick={collecterMaintenant} disabled={!branche || collecte}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-edge text-sm px-4 py-2 text-ink disabled:opacity-50">
              {collecte
                ? <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                : <RefreshCw size={14} aria-hidden="true" />}
              {T('collecter')}
            </button>
            <button type="button" onClick={voirRapport} disabled={!branche}
                    className="text-sm text-primary font-medium disabled:opacity-50">
              {T('voir_rapport')}
            </button>
          </div>
        </div>

        {/* ── Rapport : ce qui a marché, et pourquoi ─────────────────────── */}
        {rapport && (
          <div className="bg-card border border-edge rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">
              {T('rapport_titre', { n: rapport.nb_posts ?? 0 })}
            </h2>

            {(rapport.top ?? []).length === 0 ? (
              <p className="text-sm text-ghost">{T('rapport_vide')}</p>
            ) : (
              <>
                <div className="space-y-2">
                  {rapport.top.map((p, i) => (
                    <div key={p.post_id || i} className="flex items-start gap-3 border border-edge rounded-xl p-3">
                      <span className="text-xs font-bold text-ghost shrink-0 mt-0.5">#{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-ink line-clamp-2">{p.message || T('sans_texte')}</p>
                        <p className="text-[11px] text-ghost mt-1">
                          {T('portee', { n: p.portee ?? 0 })} · {T('engagements', { n: p.engagements ?? 0 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Le vrai apport n'est pas le classement, c'est ce que les
                    meilleures publications ont EN COMMUN — heure, format, sujet. */}
                <div className="grid sm:grid-cols-3 gap-3 mt-4">
                  {['heures', 'formats', 'sujets'].map((cle) => {
                    const groupe = rapport.points_communs?.[cle] || {}
                    const entrees = Object.entries(groupe)

                    return (
                      <div key={cle} className="border border-edge rounded-xl p-3">
                        <p className={ADMIN_LABEL}>{T(`commun_${cle}`)}</p>
                        {entrees.length === 0
                          ? <p className="text-xs text-ghost mt-1">—</p>
                          : entrees.map(([k, n]) => (
                              <p key={k} className="text-sm text-ink mt-1">{k} <span className="text-ghost">({n})</span></p>
                            ))}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
