import { useMemo, useRef, useState } from 'react'
import { Megaphone, Info, Image as ImageIcon, X, Rocket, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { AppLayout } from '@/components/layout'
import EmptyState from '@/components/ui/EmptyState'
import { Button, BottomSheet } from '@/components/ui'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import {
  useAnnonces, useCreerAnnonce, useImageAnnonce,
  useRetirerImage, useSupprimerAnnonce,
} from '@/hooks/useAnnonces'
import { annonceService } from '@/services/annonceService'

/**
 * ANN-1..9 — Annonces du créateur.
 *
 * Le socle serveur était complet depuis le 19/07 ; il ne manquait que cet écran.
 *
 * Toutes les règles restent côté SERVEUR et ne sont jamais recalculées ici :
 *   · la date de fin découle de la durée choisie (le créateur choisit un NOMBRE
 *     DE JOURS, jamais une date de fin — décision du boss) ;
 *   · une seule annonce par jour, le serveur refuse la seconde ;
 *   · les tarifs du Boost viennent de la configuration. L'écran les affiche en
 *     lecture seule : si la direction change un prix en admin, il change ici
 *     sans redéploiement, et un montant bricolé côté client serait rejeté.
 */

const INPUT = 'w-full border border-edge rounded-xl px-3 py-2.5 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
const LABEL = 'text-xs text-ghost mb-1 block'

const TONS = {
  programmee: 'bg-info/10 text-info',
  en_cours:   'bg-success/10 text-success',
  boostee:    'bg-primary/10 text-primary',
  terminee:   'bg-subtle text-dim',
  masquee:    'bg-danger/10 text-danger',
}

function Pastille({ statut, t }) {
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${TONS[statut] ?? TONS.terminee}`}>
      {t(`annonces.statut_${statut}`)}
    </span>
  )
}

/* ── Modale de Boost ──────────────────────────────────────────────────────── */
function ModaleBoost({ annonce, boost, onClose }) {
  const { t } = useTranslation()
  const offres = boost?.offres ?? []
  const [jours, setJours] = useState(offres[0]?.jours ?? 1)
  const [debut, setDebut] = useState(new Date().toISOString().slice(0, 10))
  const [envoi, setEnvoi] = useState(false)

  // Le prix AFFICHÉ vient de la configuration serveur ; il n'est ni saisi ni
  // recalculé — le champ est volontairement non modifiable (décision du boss).
  const prix = offres.find((o) => Number(o.jours) === Number(jours))?.prix ?? 0

  const payer = async () => {
    setEnvoi(true)
    try {
      const { checkout_url } = await annonceService.boost(annonce.id, {
        jours, date_debut: debut, return_url: window.location.href,
      })
      if (checkout_url) window.location.href = checkout_url
      else toast.error(t('erreurs.generique_titre'))
    } catch (e) {
      toast.error(e?.response?.data?.message || t('erreurs.generique_titre'))
    } finally { setEnvoi(false) }
  }

  return (
    <BottomSheet open onClose={onClose} title={t('annonces.boost_titre')}>
      <div className="px-5 pb-5 space-y-4">
        <p className="flex items-start gap-2 text-[13px] text-dim leading-relaxed">
          <Info size={14} className="shrink-0 mt-0.5 text-primary" aria-hidden="true" />
          {t('annonces.boost_aide')}
        </p>

        {offres.length === 0 ? (
          <p className="text-sm text-ghost">{t('annonces.boost_indispo')}</p>
        ) : (
          <>
            <div>
              <span className={LABEL}>{t('annonces.boost_debut')}</span>
              <input type="date" className={INPUT} value={debut}
                     min={new Date().toISOString().slice(0, 10)}
                     onChange={(e) => setDebut(e.target.value)} />
            </div>

            <div>
              <span className={LABEL}>{t('annonces.boost_duree')}</span>
              <div className="flex gap-2 flex-wrap">
                {offres.map((o) => (
                  <button key={o.jours} type="button" onClick={() => setJours(o.jours)}
                    className={'px-3.5 py-2 rounded-xl border text-sm font-medium transition '
                      + (Number(jours) === Number(o.jours)
                        ? 'border-primary bg-primary/8 text-primary'
                        : 'border-edge text-dim hover:border-primary')}>
                    {t('annonces.form_jours', { count: o.jours })}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-edge pt-3">
              <span className="text-sm text-dim">{t('annonces.boost_total')}</span>
              <span className="text-lg font-bold text-primary font-mono">{formatCurrency(prix)}</span>
            </div>

            <Button onClick={payer} loading={envoi} icon={Rocket} className="w-full">
              {t('annonces.boost_payer')}
            </Button>
          </>
        )}
      </div>
    </BottomSheet>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function AnnoncesPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAnnonces()
  const creer = useCreerAnnonce()
  const envoyerImage = useImageAnnonce()
  const retirerImage = useRetirerImage()
  const supprimer = useSupprimerAnnonce()

  const annonces = data?.annonces ?? []
  const quota = data?.quota
  const boost = data?.boost
  const peutPublier = quota?.peut_publier !== false

  const [form, setForm] = useState({
    titre: '', message: '', duree_jours: 1,
    date_debut: new Date().toISOString().slice(0, 10),
  })
  const [fichier, setFichier] = useState(null)
  const [boostVise, setBoostVise] = useState(null)
  const champFichier = useRef(null)

  const apercuImage = useMemo(
    () => (fichier ? URL.createObjectURL(fichier) : null),
    [fichier],
  )

  const publier = async (e) => {
    e.preventDefault()
    try {
      const annonce = await creer.mutateAsync(form)
      // L'image part APRÈS la création : le serveur la range sous l'identifiant
      // de l'annonce. Si son envoi échoue, l'annonce existe quand même — on le
      // dit sans faire croire à un échec complet.
      if (fichier && annonce?.id) {
        try { await envoyerImage.mutateAsync({ id: annonce.id, fichier }) }
        catch { toast.error(t('erreurs.generique_titre')) }
      }
      setForm({ titre: '', message: '', duree_jours: 1, date_debut: new Date().toISOString().slice(0, 10) })
      setFichier(null)
      if (champFichier.current) champFichier.current.value = ''
    } catch (e2) {
      toast.error(e2?.response?.data?.message || t('erreurs.generique_titre'))
    }
  }

  return (
    <AppLayout title={t('annonces.titre')} showBack>
      <div className="px-4 pb-8 space-y-5 mt-4">

        <p className="text-[13px] text-dim leading-relaxed">{t('annonces.sous_titre')}</p>

        {/* Quota atteint : on l'annonce AVANT le formulaire plutôt que de laisser
            l'utilisateur tout saisir pour se faire refuser à l'envoi. */}
        {!peutPublier && (
          <div className="bg-warning/10 border border-warning/25 rounded-2xl p-4 space-y-1">
            <p className="flex items-start gap-2 text-[13px] font-medium text-ink">
              <Info size={14} className="shrink-0 mt-0.5 text-warning" aria-hidden="true" />
              {t('annonces.quota_bloque')}
            </p>
            {quota?.prochaine_fenetre && (
              <p className="text-xs text-dim pl-6">
                {t('annonces.quota_demain', { date: formatDate(quota.prochaine_fenetre) })}
              </p>
            )}
            <p className="text-xs text-dim pl-6">{t('annonces.quota_boost')}</p>
          </div>
        )}

        {peutPublier && (
          <form onSubmit={publier} className="bg-card border border-edge rounded-2xl p-4 space-y-3.5">
            <div>
              <span className={LABEL}>{t('annonces.form_titre')}</span>
              <input className={INPUT} maxLength={120} required value={form.titre}
                     onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))} />
            </div>

            <div>
              <span className={LABEL}>{t('annonces.form_message')}</span>
              <textarea className={INPUT + ' resize-none'} rows={3} maxLength={500} required
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className={LABEL}>{t('annonces.form_debut')}</span>
                <input type="date" className={INPUT} required value={form.date_debut}
                       min={new Date().toISOString().slice(0, 10)}
                       onChange={(e) => setForm((f) => ({ ...f, date_debut: e.target.value }))} />
              </div>
              <div>
                {/* Le créateur choisit un NOMBRE DE JOURS, jamais une date de
                    fin : c'est le serveur qui la calcule (durée inclusive). */}
                <span className={LABEL}>{t('annonces.form_duree')}</span>
                <select className={INPUT} value={form.duree_jours}
                        onChange={(e) => setForm((f) => ({ ...f, duree_jours: Number(e.target.value) }))}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((j) => (
                    <option key={j} value={j}>{t('annonces.form_jours', { count: j })}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className={LABEL}>{t('annonces.form_image')}</span>
              {apercuImage ? (
                <div className="relative">
                  <img src={apercuImage} alt="" className="w-full h-32 object-cover rounded-xl" />
                  <button type="button"
                          onClick={() => { setFichier(null); if (champFichier.current) champFichier.current.value = '' }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/70 text-white flex items-center justify-center"
                          aria-label={t('annonces.form_image_retirer')}>
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 h-20 rounded-xl border border-dashed border-edge text-sm text-ghost cursor-pointer hover:border-primary hover:text-primary transition">
                  <ImageIcon size={16} aria-hidden="true" />
                  {t('annonces.form_image')}
                  <input ref={champFichier} type="file" accept="image/jpeg,image/png,image/webp"
                         className="hidden"
                         onChange={(e) => setFichier(e.target.files?.[0] ?? null)} />
                </label>
              )}
            </div>

            <Button type="submit" loading={creer.isPending} icon={Megaphone} className="w-full">
              {t('annonces.publier')}
            </Button>
          </form>
        )}

        {/* ── Historique ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-ghost mb-2.5">
            {t('annonces.historique')}
          </h2>

          {isLoading && (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-subtle animate-pulse" />)}
            </div>
          )}

          {!isLoading && annonces.length === 0 && (
            <EmptyState icon={Megaphone} title={t('annonces.vide_titre')} description={t('annonces.vide_desc')} />
          )}

          <div className="space-y-3">
            {annonces.map((a) => (
              <div key={a.id} className="bg-card border border-edge rounded-2xl overflow-hidden">
                {a.image_url && (
                  <img src={a.image_url} alt="" className="w-full h-28 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-ink flex-1 min-w-0">{a.titre}</p>
                    <Pastille statut={a.statut} t={t} />
                  </div>
                  <p className="text-[13px] text-dim leading-relaxed line-clamp-3">{a.message}</p>
                  <p className="text-[11px] text-ghost mt-2">
                    {t('annonces.du_au', { debut: formatDate(a.date_debut), fin: formatDate(a.date_fin) })}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    {/* Le Boost n'a de sens que sur une annonce encore diffusable. */}
                    {['programmee', 'en_cours'].includes(a.statut) && boost?.actif && (
                      <button type="button" onClick={() => setBoostVise(a)}
                              className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                        <Rocket size={13} aria-hidden="true" />{t('annonces.boost')}
                      </button>
                    )}
                    {a.image_url && (
                      <button type="button" onClick={() => retirerImage.mutate(a.id)}
                              className="text-xs text-ghost hover:text-danger">
                        {t('annonces.form_image_retirer')}
                      </button>
                    )}
                    <button type="button"
                            onClick={() => { if (window.confirm(t('annonces.supprimer_confirmer'))) supprimer.mutate(a.id) }}
                            className="ml-auto inline-flex items-center gap-1.5 text-xs text-ghost hover:text-danger">
                      <Trash2 size={13} aria-hidden="true" />{t('commun.supprimer')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {boostVise && (
        <ModaleBoost annonce={boostVise} boost={boost} onClose={() => setBoostVise(null)} />
      )}
    </AppLayout>
  )
}
