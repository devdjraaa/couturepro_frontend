import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, Users, Loader2, Pin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AdminLayout, AdminModal, ADMIN_INPUT, ADMIN_LABEL } from '@/components/admin'
import { infosAdminService } from '@/services/admin/reglagesVitrineAdminService'
import { formatDate } from '@/utils/formatDate'

/**
 * CLI-2 — Diffusion des « Gextimo Infos ».
 *
 * Le point structurant de cet écran est l'APERÇU DE PORTÉE : le nombre
 * d'ateliers touchés est recalculé à chaque changement de ciblage, avant
 * l'envoi. Sans lui, une valeur mal saisie — une ville mal orthographiée, une
 * clé de formule qui n'existe plus — produit une diffusion qui n'atteint
 * personne, et rien ne le signale.
 */

const MODES = ['tous', 'types_compte', 'plans', 'villes', 'ateliers']

const VIDE = {
  titre: '', contenu: '', categorie: '', lien: '', epingle: false,
  publie_at: '', expire_at: '',
  cible: { mode: 'tous', valeurs: [] },
}

/** Le serveur attend `null`, pas une chaîne vide, pour « pas de date ». */
const dateOuNull = (v) => (v ? v.replace('T', ' ') + ':00' : null)

export default function AdminInfosPage() {
  const { t } = useTranslation()
  const T = (c, o) => t(`admin.infos.${c}`, o)

  const [infos, setInfos] = useState([])
  const [categories, setCategories] = useState([])
  const [chargement, setChargement] = useState(true)
  const [form, setForm] = useState(null)     // null = formulaire fermé
  const [portee, setPortee] = useState(null)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState(null)

  const charger = async () => {
    setChargement(true)
    try {
      const d = await infosAdminService.getAll()
      setInfos(d.infos)
      setCategories(d.categories)
    } finally { setChargement(false) }
  }

  useEffect(() => { charger() }, [])

  const parCle = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.cle, c])),
    [categories],
  )

  // La portée se recalcule à chaque modification du ciblage. Le délai évite
  // d'interroger le serveur à chaque frappe dans la liste de valeurs.
  useEffect(() => {
    if (!form) { setPortee(null); return undefined }

    const id = setTimeout(() => {
      infosAdminService.portee(form.cible).then(setPortee).catch(() => setPortee(null))
    }, 400)

    return () => clearTimeout(id)
  }, [form?.cible])   // eslint-disable-line react-hooks/exhaustive-deps

  const ouvrir = (info = null) => {
    setErreur(null)
    setForm(info ? {
      ...info,
      lien: info.lien ?? '',
      publie_at: info.publie_at ? String(info.publie_at).slice(0, 16).replace(' ', 'T') : '',
      expire_at: info.expire_at ? String(info.expire_at).slice(0, 16).replace(' ', 'T') : '',
      cible: info.cible ?? { mode: 'tous', valeurs: [] },
    } : { ...VIDE, categorie: categories[0]?.cle ?? '' })
  }

  const majCible = (cle, val) =>
    setForm((f) => ({ ...f, cible: { ...f.cible, [cle]: val } }))

  const enregistrer = async (e) => {
    e.preventDefault()
    setEnvoi(true)
    setErreur(null)

    const payload = {
      ...form,
      lien: form.lien?.trim() || null,
      publie_at: dateOuNull(form.publie_at),
      expire_at: dateOuNull(form.expire_at),
    }

    try {
      if (form.id) await infosAdminService.modifier(form.id, payload)
      else await infosAdminService.creer(payload)
      setForm(null)
      await charger()
    } catch (err) {
      // Le message du serveur est plus utile qu'un texte générique : il nomme
      // le champ refusé.
      setErreur(err?.message || t('erreurs.inconnu'))
    } finally { setEnvoi(false) }
  }

  const supprimer = async (info) => {
    if (!window.confirm(T('confirmer_suppression'))) return
    await infosAdminService.supprimer(info.id)
    await charger()
  }

  return (
    <AdminLayout title={T('titre')}>
      <div className="max-w-3xl">
        <p className="text-xs text-dim leading-relaxed mb-4">{T('aide')}</p>

        <button type="button" onClick={() => ouvrir()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-inverse text-sm font-semibold px-4 py-2 mb-5">
          <Plus size={15} aria-hidden="true" />{T('nouvelle')}
        </button>

        {chargement ? (
          <p className="text-sm text-ghost flex items-center gap-2">
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />{t('commun.chargement')}
          </p>
        ) : infos.length === 0 ? (
          <p className="text-sm text-ghost py-8 text-center">{T('aucune')}</p>
        ) : (
          <div className="space-y-3">
            {infos.map((i) => {
              const cat = parCle[i.categorie]

              return (
                <div key={i.id} className="rounded-2xl border border-edge bg-card p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0"
                          style={{ backgroundColor: `${cat?.couleur || '#888'}1a`, color: cat?.couleur || '#888' }}>
                      {cat?.label || i.categorie}
                    </span>
                    {i.epingle && <Pin size={12} className="text-ghost shrink-0 mt-0.5" aria-hidden="true" />}

                    <span className="text-[11px] text-ghost ml-auto shrink-0">
                      {formatDate(i.publie_at || i.created_at)}
                    </span>
                  </div>

                  <p className="font-semibold text-ink mt-1.5">{i.titre}</p>
                  <p className="text-sm text-dim leading-relaxed mt-0.5 line-clamp-3 whitespace-pre-line">{i.contenu}</p>

                  <div className="flex items-center gap-3 mt-3 text-[11px] text-ghost">
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} aria-hidden="true" />{T('portee', { n: i.portee ?? 0 })}
                    </span>
                    <span>{T('lectures', { n: i.lectures ?? 0 })}</span>

                    <button type="button" onClick={() => ouvrir(i)} className="ml-auto text-dim hover:text-primary p-1"
                            aria-label={T('modifier')}>
                      <Pencil size={14} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => supprimer(i)} className="text-dim hover:text-danger p-1"
                            aria-label={t('commun.supprimer')}>
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {form && (
        <AdminModal
          onClose={() => setForm(null)}
          title={form.id ? T('modifier') : T('nouvelle')}
          size="xl"
          footer={
            <>
              <button type="button" onClick={() => setForm(null)} className="text-sm text-dim">
                {t('commun.annuler')}
              </button>
              <button type="submit" form="info-form" disabled={envoi}
                      className="ml-auto rounded-xl bg-primary text-inverse text-sm font-semibold px-5 py-2 disabled:opacity-50">
                {envoi ? t('commun.chargement') : T('diffuser')}
              </button>
            </>
          }
        >
          <form id="info-form" onSubmit={enregistrer}>
            <div>
              <span className={ADMIN_LABEL}>{T('champ_titre')}</span>
              <input className={ADMIN_INPUT} maxLength={120} required value={form.titre}
                     onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))} />
            </div>

            <div className="mt-3">
              <span className={ADMIN_LABEL}>{T('contenu')}</span>
              <textarea className={ADMIN_INPUT + ' resize-none'} rows={5} maxLength={4000} required value={form.contenu}
                        onChange={(e) => setForm((f) => ({ ...f, contenu: e.target.value }))} />
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div>
                <span className={ADMIN_LABEL}>{T('categorie')}</span>
                <select className={ADMIN_INPUT} required value={form.categorie}
                        onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))}>
                  {categories.map((c) => <option key={c.cle} value={c.cle}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <span className={ADMIN_LABEL}>{T('lien')}</span>
                <input className={ADMIN_INPUT} maxLength={300} value={form.lien}
                       onChange={(e) => setForm((f) => ({ ...f, lien: e.target.value }))} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div>
                <span className={ADMIN_LABEL}>{T('publie_at')}</span>
                <input type="datetime-local" className={ADMIN_INPUT} value={form.publie_at}
                       onChange={(e) => setForm((f) => ({ ...f, publie_at: e.target.value }))} />
              </div>
              <div>
                <span className={ADMIN_LABEL}>{T('expire_at')}</span>
                <input type="datetime-local" className={ADMIN_INPUT} value={form.expire_at}
                       onChange={(e) => setForm((f) => ({ ...f, expire_at: e.target.value }))} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink mt-3">
              <input type="checkbox" checked={!!form.epingle}
                     onChange={(e) => setForm((f) => ({ ...f, epingle: e.target.checked }))} />
              {T('epingle')}
            </label>

            {/* ── Ciblage ─────────────────────────────────────────────── */}
            <div className="mt-4 pt-4 border-t border-edge">
              <span className={ADMIN_LABEL}>{T('cible')}</span>
              <select className={ADMIN_INPUT} value={form.cible.mode}
                      onChange={(e) => majCible('mode', e.target.value)}>
                {MODES.map((m) => <option key={m} value={m}>{T(`cible_${m}`)}</option>)}
              </select>

              {form.cible.mode !== 'tous' && (
                <div className="mt-3">
                  <span className={ADMIN_LABEL}>{T('valeurs')}</span>
                  <textarea className={ADMIN_INPUT + ' resize-none font-mono text-[13px]'} rows={3}
                            value={(form.cible.valeurs ?? []).join('\n')}
                            onChange={(e) => majCible('valeurs',
                              e.target.value.split('\n').map((x) => x.trim()).filter(Boolean))} />
                </div>
              )}

              {portee !== null && (
                <p className={`text-xs mt-2 inline-flex items-center gap-1.5 ${portee === 0 ? 'text-warning' : 'text-dim'}`}>
                  <Users size={13} aria-hidden="true" />
                  {portee === 0 ? T('portee_zero') : T('portee', { n: portee })}
                </p>
              )}
            </div>

            {erreur && <p className="text-xs text-danger mt-3">{erreur}</p>}
          </form>
        </AdminModal>
      )}
    </AdminLayout>
  )
}
