// P202 : Espace client vitrine — connexion sans mot de passe (Google / OTP e-mail),
// consentement APDP, mes commandes (suivi par étapes), avis (si livrée) et réclamations.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, LogOut, Package, Star, AlertTriangle, Send, ShieldCheck, CheckCircle2 } from 'lucide-react'
import VitrineShell from './VitrineChrome'
import { usePageMeta } from '@/hooks/usePageMeta'
import {
  demanderOtp, verifierOtp, loginGoogle, getMe, envoyerConsentement, clientLogout,
  getMesCommandes, commander, laisserAvis, reclamer, getClientToken, setClientToken,
  getConfigPublique, majProfil,
} from './espaceClientApi'
import { track, initAnalyticsTiers } from '@/utils/gxtTracking'
import { consommerAction, lireAction } from './actionEnAttente'
import { toggleAbonnement } from './vitrineApi'

const ETAPES = ['commande', 'coupe', 'confection', 'essayage', 'livraison']
const input = 'w-full rounded-xl px-4 py-3 text-[15px] outline-none text-ink bg-subtle border border-edge placeholder:text-ghost focus:border-primary transition'
const btn = 'inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition disabled:opacity-60'
const btnGhost = 'inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl border border-edge text-ink hover:border-primary hover:text-primary transition'

export default function EspaceClientPage() {
  const { t } = useTranslation()
  usePageMeta({ title: t('vitrine.espace_client.title'), description: t('vitrine.espace_client.subtitle'), path: '/espace-client' })
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [config, setConfig] = useState({})
  const [me, setMe] = useState(undefined) // undefined = chargement, null = non connecté
  // EC-3 : intention mise de côté avant la connexion, à rejouer une fois connecté.
  const [attente] = useState(() => lireAction())

  /**
   * Rejoue l'action qui avait envoyé l'utilisateur se connecter, puis le ramène
   * d'où il venait. Sans cela il se connecte et retombe sur une page qui ne dit
   * rien de ce qu'il essayait de faire.
   */
  const reprendreAction = async () => {
    const a = consommerAction()
    if (!a) return false

    if (a.type === 'suivre_createur' && a.payload?.atelierId) {
      const { ok } = await toggleAbonnement(a.payload.atelierId)
      // Un échec ici n'est pas bloquant : on ramène quand même l'utilisateur sur
      // le profil, où l'état réel de l'abonnement sera rechargé depuis le serveur.
      if (ok) track('abonnement_createur', { atelier_id: a.payload.atelierId, via: 'reprise_connexion' })
    }

    if (a.retour) { navigate(a.retour, { replace: true }); return true }
    return false
  }

  useEffect(() => {
    getConfigPublique().then(({ data }) => setConfig(data || {}))
    if (getClientToken()) {
      getMe().then(({ ok, data }) => {
        setMe(ok ? data : null)
        if (ok && data?.consentement) initAnalyticsTiers(data.consentement, (config?.analytics) || {})
      })
    } else {
      setMe(null)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <VitrineShell>
      <section className="py-14">
        <div className="max-w-[760px] mx-auto px-5">
          <h1 className="font-display text-[clamp(24px,3vw,32px)] text-ink">{t('vitrine.espace_client.title')}</h1>
          <p className="text-dim mt-1 mb-8">{t('vitrine.espace_client.subtitle')}</p>

          {me === undefined && <p className="text-dim">{t('commun.chargement')}</p>}
          {me === null && (
            <>
              {/* EC-3 : dire POURQUOI on demande de se connecter — sinon l'écran
                  paraît sans rapport avec le bouton qui vient d'être cliqué. */}
              {attente?.type === 'suivre_createur' && (
                <p className="mb-5 rounded-lg border border-edge bg-subtle px-4 py-3 text-[13px] text-dim">
                  {t('vitrine.espace_client.reprise_suivre', { createur: attente.payload?.nom || '' })}
                </p>
              )}
              <Login config={config} onDone={async (data) => {
                if (await reprendreAction()) return   // redirigé : inutile de rendre l'espace
                setMe(data)
              }} />
            </>
          )}
          {me && <Espace me={me} config={config} onLogout={() => { clientLogout(); setMe(null) }}
                         commanderAtelier={params.get('commander')} commanderNom={params.get('designer')} />}
        </div>
      </section>
    </VitrineShell>
  )
}

/* ── Connexion (Google + OTP e-mail) ─────────────────────────────────────────── */
function Login({ config, onDone }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [etape, setEtape] = useState('email') // email | code
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const googleRef = useRef(null)

  // Bouton Google officiel (GIS) — uniquement si le client ID est configuré côté serveur.
  useEffect(() => {
    const clientId = config?.google_web_client_id
    if (!clientId || !googleRef.current) return
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          const { ok, data } = await loginGoogle(credential)
          if (ok) { setClientToken(data.token); track('vue_profil_designer', {}); onDone({ client: data.client, consentement: data.consentement }) }
        },
      })
      window.google?.accounts.id.renderButton(googleRef.current, { theme: 'outline', size: 'large', width: 320 })
    }
    document.head.appendChild(s)
  }, [config?.google_web_client_id]) // eslint-disable-line react-hooks/exhaustive-deps

  const envoyer = async () => {
    setErr(''); setLoading(true)
    const { ok, data } = await demanderOtp(email.trim())
    setLoading(false)
    if (ok) setEtape('code')
    else setErr(data?.message || t('vitrine.espace_client.erreur'))
  }

  const verifier = async () => {
    setErr(''); setLoading(true)
    const { ok, data } = await verifierOtp(email.trim(), code.trim())
    setLoading(false)
    if (ok) { setClientToken(data.token); onDone({ client: data.client, consentement: data.consentement }) }
    else setErr(data?.message || t('vitrine.espace_client.code_invalide'))
  }

  return (
    <div className="bg-card border border-edge rounded-2xl p-6">
      <div ref={googleRef} className="flex justify-center mb-4" />
      {config?.google_web_client_id && (
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-edge" /><span className="text-xs text-ghost">{t('vitrine.espace_client.ou')}</span><div className="flex-1 h-px bg-edge" />
        </div>
      )}

      {etape === 'email' ? (
        <>
          <label className="text-sm font-semibold text-ink flex items-center gap-2 mb-2"><Mail size={15} />{t('vitrine.espace_client.email_label')}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('vitrine.espace_client.email_placeholder')}
                 onKeyDown={(e) => e.key === 'Enter' && envoyer()} className={input} />
          <p className="text-xs text-ghost mt-2">{t('vitrine.espace_client.sans_mdp')}</p>
          <button onClick={envoyer} disabled={loading || !email.includes('@')} className={btn + ' w-full mt-4'}>{t('vitrine.espace_client.recevoir_code')}</button>
        </>
      ) : (
        <>
          <p className="text-sm text-dim mb-3">{t('vitrine.espace_client.code_envoye', { email })}</p>
          <input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                 onKeyDown={(e) => e.key === 'Enter' && verifier()} placeholder="000000"
                 className={input + ' text-center tracking-[8px] font-bold text-lg'} />
          <button onClick={verifier} disabled={loading || code.length !== 6} className={btn + ' w-full mt-4'}>{t('vitrine.espace_client.se_connecter')}</button>
          <button onClick={() => setEtape('email')} className="text-xs text-dim hover:text-primary mt-3 mx-auto block">{t('vitrine.espace_client.changer_email')}</button>
        </>
      )}
      {err && <p className="text-danger text-sm mt-3">{err}</p>}
    </div>
  )
}

/* ── Espace connecté ─────────────────────────────────────────────────────────── */
function Espace({ me, config, onLogout, commanderAtelier, commanderNom }) {
  const { t } = useTranslation()
  const [consent, setConsent] = useState(me.consentement)
  const [commandes, setCommandes] = useState(null)
  const [modal, setModal] = useState(null) // { type: 'avis'|'reclamation', commande }
  const [flash, setFlash] = useState('')

  const recharger = () => getMesCommandes().then(({ ok, data }) => setCommandes(ok ? data : []))
  useEffect(() => { recharger() }, [])

  const nomClient = useMemo(() => me.client?.prenom || me.client?.email?.split('@')[0] || '', [me])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-ink font-semibold">{t('vitrine.espace_client.bonjour', { nom: nomClient })}</p>
        <button onClick={onLogout} className="inline-flex items-center gap-1.5 text-[13px] text-dim hover:text-danger transition"><LogOut size={14} />{t('vitrine.espace_client.deconnexion')}</button>
      </div>

      {!consent && <BandeauConsentement onDone={(c) => { setConsent(c); initAnalyticsTiers(c, config?.analytics || {}) }} />}
      {flash && <p className="text-sm rounded-xl px-4 py-3 bg-primary-50 text-primary flex items-center gap-2"><CheckCircle2 size={15} />{flash}</p>}

      {commanderAtelier && (
        <FormCommande atelierId={commanderAtelier} designer={commanderNom}
                      onDone={(msg) => { setFlash(msg); recharger() }} />
      )}

      <SectionProfil client={me.client} onDone={(msg) => setFlash(msg)} />

      <div>
        <h2 className="font-display text-lg text-ink flex items-center gap-2 mb-3"><Package size={17} />{t('vitrine.espace_client.mes_commandes')}</h2>
        {commandes === null && <p className="text-dim text-sm">{t('commun.chargement')}</p>}
        {Array.isArray(commandes) && commandes.length === 0 && (
          <div className="bg-card border border-edge rounded-2xl p-6 text-center">
            <p className="text-dim text-sm">{t('vitrine.espace_client.aucune_commande')}</p>
            <Link to="/createurs" className={btn + ' mt-4'}>{t('vitrine.espace_client.decouvrir')}</Link>
          </div>
        )}
        {Array.isArray(commandes) && commandes.map((c) => (
          <CarteCommande key={c.id} c={c} onAvis={() => setModal({ type: 'avis', commande: c })}
                         onReclamation={() => setModal({ type: 'reclamation', commande: c })} />
        ))}
      </div>

      {modal?.type === 'avis' && <ModalAvis commande={modal.commande} onClose={() => setModal(null)}
        onDone={(msg) => { setModal(null); setFlash(msg); recharger() }} />}
      {modal?.type === 'reclamation' && <ModalReclamation commande={modal.commande} onClose={() => setModal(null)}
        onDone={(msg) => { setModal(null); setFlash(msg) }} />}
    </div>
  )
}

/* ── Mon profil (brief 16/07 pt 3 : personnalisation + anniversaire) ─────────── */
function SectionProfil({ client, onDone }) {
  const { t } = useTranslation()
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({
    prenom: client?.prenom || '', nom: client?.nom || '',
    ville: client?.ville || '', date_naissance: client?.date_naissance?.slice(0, 10) || '',
  })
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const enregistrer = async () => {
    setLoading(true)
    const { ok } = await majProfil({
      prenom: form.prenom.trim() || null, nom: form.nom.trim() || null,
      ville: form.ville.trim() || null, date_naissance: form.date_naissance || null,
    })
    setLoading(false)
    if (ok) { setOuvert(false); onDone(t('vitrine.espace_client.profil_enregistre')) }
  }

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} className="text-[13px] text-dim hover:text-primary transition">
        {t('vitrine.espace_client.profil_modifier')}
      </button>
    )
  }
  return (
    <div className="bg-card border border-edge rounded-2xl p-5">
      <h3 className="font-display text-[16px] text-ink mb-3">{t('vitrine.espace_client.profil_titre')}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={form.prenom} onChange={set('prenom')} placeholder={t('vitrine.espace_client.profil_prenom')} className={input} />
        <input value={form.nom} onChange={set('nom')} placeholder={t('vitrine.espace_client.profil_nom')} className={input} />
        <input value={form.ville} onChange={set('ville')} placeholder={t('vitrine.espace_client.profil_ville')} className={input} />
        <div>
          <input type="date" value={form.date_naissance} onChange={set('date_naissance')} max={new Date().toISOString().slice(0, 10)} className={input} />
          <p className="text-[11px] text-ghost mt-1">{t('vitrine.espace_client.profil_naissance_hint')}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={enregistrer} disabled={loading} className={btn}>{t('vitrine.espace_client.profil_enregistrer')}</button>
        <button onClick={() => setOuvert(false)} className={btnGhost}>{t('commun.annuler')}</button>
      </div>
    </div>
  )
}

/* ── Consentement APDP (interrupteur du tracking) ────────────────────────────── */
function BandeauConsentement({ onDone }) {
  const { t } = useTranslation()
  const [choix, setChoix] = useState({ cookie_consent: true, analytics_consent: true, personalization_consent: true, marketing_consent: false })
  const cases = [
    ['cookie_consent', t('vitrine.espace_client.consent_cookies')],
    ['analytics_consent', t('vitrine.espace_client.consent_analytics')],
    ['personalization_consent', t('vitrine.espace_client.consent_perso')],
    ['marketing_consent', t('vitrine.espace_client.consent_marketing')],
  ]
  const valider = async (tout) => {
    const c = tout ? { cookie_consent: true, analytics_consent: true, personalization_consent: true, marketing_consent: true } : choix
    const { ok, data } = await envoyerConsentement({ ...c, version_politique: '1.0' })
    if (ok) onDone(data.consentement)
  }
  return (
    <div className="bg-card border border-primary/30 rounded-2xl p-5">
      <p className="font-semibold text-ink text-sm flex items-center gap-2 mb-2"><ShieldCheck size={16} className="text-primary" />{t('vitrine.espace_client.consent_titre')}</p>
      <p className="text-[13px] text-dim mb-3">{t('vitrine.espace_client.consent_texte')} <Link to="/confidentialite" className="text-primary underline">{t('vitrine.espace_client.consent_politique')}</Link></p>
      <div className="grid sm:grid-cols-2 gap-2 mb-4">
        {cases.map(([k, label]) => (
          <label key={k} className="flex items-center gap-2 text-[13px] text-ink cursor-pointer">
            <input type="checkbox" checked={choix[k]} onChange={(e) => setChoix((v) => ({ ...v, [k]: e.target.checked }))} className="accent-[var(--rouge,#D00B0B)]" />
            {label}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => valider(true)} className={btn}>{t('vitrine.espace_client.consent_tout')}</button>
        <button onClick={() => valider(false)} className={btnGhost}>{t('vitrine.espace_client.consent_choix')}</button>
      </div>
    </div>
  )
}

/* ── Nouvelle commande (arrivée depuis « Commander » sur un profil) ──────────── */
function FormCommande({ atelierId, designer, onDone }) {
  const { t } = useTranslation()
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [envoyee, setEnvoyee] = useState(false)
  if (envoyee) return null

  const envoyer = async () => {
    setErr(''); setLoading(true)
    const { ok, data } = await commander(atelierId, instructions.trim())
    setLoading(false)
    if (ok) { track('commande_passee', { atelier_id: atelierId }); setEnvoyee(true); onDone(data?.message || t('vitrine.espace_client.commande_envoyee')) }
    else setErr(data?.message || t('vitrine.espace_client.erreur'))
  }

  return (
    <div className="bg-card border border-edge rounded-2xl p-5">
      <h3 className="font-display text-[16px] text-ink mb-1">{t('vitrine.espace_client.commander_chez', { designer: designer || t('vitrine.espace_client.ce_createur') })}</h3>
      <p className="text-[13px] text-dim mb-3">{t('vitrine.espace_client.commander_hint')}</p>
      <textarea rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)}
                placeholder={t('vitrine.espace_client.instructions_placeholder')} className={input + ' resize-none'} />
      {err && <p className="text-danger text-sm mt-2">{err}</p>}
      <button onClick={envoyer} disabled={loading || instructions.trim().length < 10} className={btn + ' mt-3'}>
        <Send size={15} />{t('vitrine.espace_client.envoyer_commande')}
      </button>
    </div>
  )
}

/* ── Carte commande (timeline d'étapes) ──────────────────────────────────────── */
function CarteCommande({ c, onAvis, onReclamation }) {
  const { t } = useTranslation()
  const idx = c.statut === 'livre' ? ETAPES.length : Math.max(0, ETAPES.indexOf(c.etape))
  const annulee = c.statut === 'annule'

  return (
    <div className="bg-card border border-edge rounded-2xl p-5 mb-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="font-bold text-ink text-[15px]">{c.reference}</span>
          <span className="text-dim text-[13px] ml-2">{t('vitrine.espace_client.chez', { designer: c.designer })}</span>
        </div>
        <span className={'text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ' + (annulee ? 'bg-danger/10 text-danger' : c.statut === 'livre' ? 'bg-primary-50 text-primary' : 'bg-subtle text-dim')}>
          {annulee ? t('vitrine.espace_client.statut_annulee') : c.statut === 'livre' ? t('vitrine.espace_client.statut_livree') : t(`vitrine.suivi_etapes.${c.etape}`, c.etape)}
        </span>
      </div>

      {!annulee && (
        <div className="flex items-center gap-1 mt-4">
          {ETAPES.map((e, i) => (
            <div key={e} className="flex-1 flex items-center gap-1">
              <div className={'h-1.5 rounded-full flex-1 ' + (i < idx || c.statut === 'livre' ? 'bg-primary' : 'bg-edge')} />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        {c.avis_possible && (
          <button onClick={onAvis} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline"><Star size={14} />{t('vitrine.espace_client.laisser_avis')}</button>
        )}
        <button onClick={onReclamation} className="inline-flex items-center gap-1.5 text-[13px] text-dim hover:text-danger transition"><AlertTriangle size={14} />{t('vitrine.espace_client.signaler')}</button>
      </div>
    </div>
  )
}

/* ── Modales avis / réclamation ──────────────────────────────────────────────── */
function Modale({ titre, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-edge rounded-2xl p-6 w-full max-w-[440px]" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg text-ink mb-4">{titre}</h3>
        {children}
      </div>
    </div>
  )
}

function ModalAvis({ commande, onClose, onDone }) {
  const { t } = useTranslation()
  const [note, setNote] = useState(5)
  const [texte, setTexte] = useState('')
  const [loading, setLoading] = useState(false)
  const envoyer = async () => {
    setLoading(true)
    const { ok, data } = await laisserAvis(commande.id, note, texte.trim() || null)
    setLoading(false)
    if (ok) { track('avis_laisse', { commande_id: commande.id }); onDone(data?.message || t('vitrine.espace_client.avis_merci')) }
  }
  return (
    <Modale titre={t('vitrine.espace_client.avis_titre', { ref: commande.reference })} onClose={onClose}>
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setNote(n)} aria-label={`${n}/5`}>
            <Star size={26} className={n <= note ? 'fill-primary text-primary' : 'text-edge'} />
          </button>
        ))}
      </div>
      <textarea rows={3} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder={t('vitrine.espace_client.avis_placeholder')} className={input + ' resize-none'} />
      <button onClick={envoyer} disabled={loading} className={btn + ' w-full mt-4'}>{t('vitrine.espace_client.publier_avis')}</button>
    </Modale>
  )
}

function ModalReclamation({ commande, onClose, onDone }) {
  const { t } = useTranslation()
  const [sujet, setSujet] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const envoyer = async () => {
    setLoading(true)
    const { ok, data } = await reclamer(commande.id, sujet.trim(), message.trim())
    setLoading(false)
    if (ok) { track('reclamation_ouverte', { commande_id: commande.id }); onDone(data?.message || t('vitrine.espace_client.reclamation_envoyee')) }
  }
  return (
    <Modale titre={t('vitrine.espace_client.reclamation_titre', { ref: commande.reference })} onClose={onClose}>
      <input value={sujet} onChange={(e) => setSujet(e.target.value)} placeholder={t('vitrine.espace_client.reclamation_sujet')} className={input + ' mb-3'} />
      <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('vitrine.espace_client.reclamation_message')} className={input + ' resize-none'} />
      <button onClick={envoyer} disabled={loading || sujet.trim().length < 3 || message.trim().length < 10} className={btn + ' w-full mt-4'}>{t('vitrine.espace_client.envoyer_reclamation')}</button>
    </Modale>
  )
}
