import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Heart, Globe, X, Menu, LogIn, UserPlus, Lock, Settings2, Sparkles, BarChart3, Megaphone, Cookie as CookieIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme, useLang } from '@/contexts'
import { cn } from '@/utils/cn'
import { useDevise, DEVISES } from './vitrineCurrency'
import { getBanniere } from './vitrineApi'
import { useFavoris } from './useFavoris'
import { API_BASE_URL } from '@/constants/config'
import ChatWidget from './ChatWidget'

const FIRST_VISIT_KEY = 'gx_welcome_done'

/* Symbole orbital + wordmark (charte). */
export function VitrineLogo({ onDark = false }) {
  const ring = onDark ? 'var(--color-text-inverse)' : 'var(--color-ink)'
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 100 100" className="w-8 h-8 shrink-0" aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="none" stroke={ring} strokeWidth="3.4" />
        <circle cx="50" cy="50" r="33" fill="none" stroke={ring} strokeWidth="2" opacity="0.45" />
        <circle cx="50" cy="50" r="21" fill="none" stroke={ring} strokeWidth="2" opacity="0.3" />
        {/* Arc 1 — anneau externe r=46, sens horaire */}
        <g className="vt-logo-arc">
          <path d="M50 4 A46 46 0 0 1 96 50" fill="none" stroke="var(--color-primary)" strokeWidth="6.5" strokeLinecap="round" />
        </g>
        {/* Arc 2 — anneau r=33, sens anti-horaire */}
        <g className="vt-logo-arc2">
          <path d="M50 17 A33 33 0 0 1 50 83" fill="none" stroke="var(--color-primary)" strokeWidth="5" strokeLinecap="round" />
        </g>
        <circle className="vt-logo-dot" cx="50" cy="50" r="8" fill="var(--color-primary)" />
      </svg>
      <span className={`font-display font-extrabold text-[22px] tracking-tight ${onDark ? 'text-inverse' : 'text-ink'}`}>
        gextimo
      </span>
    </span>
  )
}

/* Dropdown Globe : Langue + Devise en un seul bouton compact. */
function LocaleMenu() {
  const { langue, setLangue } = useLang()
  const { devise, setDevise } = useDevise()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])
  return (
    <div ref={ref} className="relative hidden lg:block">
      <button type="button" onClick={() => setOpen(v => !v)} aria-label="Langue et devise"
              className={cn('w-8 h-8 flex items-center justify-center rounded-[10px] border transition',
                open ? 'border-primary text-primary' : 'border-edge text-dim hover:text-ink hover:border-primary/40')}>
        <Globe size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-edge rounded-xl shadow-xl z-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ghost mb-1.5">{t('vitrine.welcome_popup.langue')}</p>
          <div className="flex gap-1.5 mb-3">
            {['fr', 'en'].map((l) => (
              <button key={l} type="button" onClick={() => setLangue(l)}
                className={cn('flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition',
                  langue === l ? 'border-primary bg-primary/5 text-primary' : 'border-edge text-dim hover:border-primary hover:text-ink')}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ghost mb-1.5">{t('vitrine.welcome_popup.devise')}</p>
          <div className="grid grid-cols-4 gap-1">
            {Object.keys(DEVISES).map((d) => (
              <button key={d} type="button" onClick={() => setDevise(d)}
                className={cn('py-1.5 rounded-lg border text-[10px] font-bold transition',
                  devise === d ? 'border-primary bg-primary/5 text-primary' : 'border-edge text-dim hover:border-primary hover:text-ink')}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* Menu burger : nav mobile + connexion. */
function NavMenu() {
  const { t } = useTranslation()
  const { langue, setLangue } = useLang()
  const { devise, setDevise } = useDevise()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Menu"
        className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-edge text-dim hover:text-ink hover:border-primary/40 transition"
      >
        {open ? <X size={15} /> : <Menu size={15} />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-card border border-edge rounded-xl shadow-xl z-50 py-2 overflow-hidden">

          {/* Nav mobile (masqué sur desktop) */}
          <div className="lg:hidden px-2 pb-2 border-b border-edge mb-2">
            {[
              { label: t('vitrine.nav.how'),         to: '/#how' },
              { label: t('vitrine.nav.creators'),    to: '/createurs' },
              { label: t('vitrine.menu2.artisans'),  to: '/artisans' },
              { label: t('vitrine.nav.collections'), to: '/#gallery' },
              { label: t('vitrine.nav.suivi'),       to: '/suivi' },
              { label: t('vitrine.nav.espace_client'), to: '/espace-client' },
              { label: t('vitrine.menu2.support'),   to: '/aide' },
              { label: t('vitrine.menu2.about'),     to: '/qui-sommes-nous' },
            ].map(({ label, to }) => (
              <Link key={to} to={to} onClick={close}
                className="block px-3 py-2 rounded-lg text-[13px] text-dim hover:text-ink hover:bg-subtle transition">
                {label}
              </Link>
            ))}
          </div>

          {/* Langue */}
          <div className="px-3 pb-2 border-b border-edge mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ghost mb-1.5">{t('vitrine.welcome_popup.langue')}</p>
            <div className="flex gap-1.5">
              {['fr', 'en'].map((l) => (
                <button key={l} type="button" onClick={() => setLangue(l)}
                  className={cn('flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition',
                    langue === l ? 'border-primary bg-primary/5 text-primary' : 'border-edge text-dim hover:border-primary/40 hover:text-ink')}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Devise */}
          <div className="px-3 pb-2 border-b border-edge mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ghost mb-1.5">{t('vitrine.welcome_popup.devise')}</p>
            <div className="grid grid-cols-4 gap-1">
              {Object.keys(DEVISES).map((d) => (
                <button key={d} type="button" onClick={() => setDevise(d)}
                  className={cn('py-1.5 rounded-lg border text-[10px] font-bold transition',
                    devise === d ? 'border-primary bg-primary/5 text-primary' : 'border-edge text-dim hover:border-primary/40 hover:text-ink')}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Connexion */}
          <div className="px-2 flex flex-col gap-1">
            <Link to="/inscription" onClick={close}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold text-dim hover:text-ink hover:bg-subtle transition">
              <UserPlus size={14} />
              {t('vitrine.nav.signup')}
            </Link>
            <Link to="/login" onClick={close}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold bg-primary text-inverse hover:bg-primary-600 transition">
              <LogIn size={14} />
              {t('vitrine.nav.login')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

/* Bascule thème clair / sombre. */
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button type="button" onClick={toggleTheme} aria-label="Thème"
            className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-edge text-dim hover:text-ink transition">
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}


/* Bandeau cookies (consentement mémorisé). */
/* Panneau cookies granulaire (maquette direction, adaptée à la charte du site —
   habillage final à reprendre par Aquilas). 5 catégories, choix mémorisé, et les
   scripts tiers (GA4/Meta/Clarity) ne se chargent que selon le consentement. */
const CATS_COOKIES = ['preferences', 'personnalisation', 'statistiques', 'marketing']

function lireConsentCookies() {
  try {
    const v = localStorage.getItem('gx_cookie_consent')
    if (!v) return null
    if (v === 'accepted') return { preferences: true, personnalisation: true, statistiques: true, marketing: true }
    if (v === 'refused') return { preferences: false, personnalisation: false, statistiques: false, marketing: false }
    return JSON.parse(v)
  } catch { return null }
}

function appliquerConsentTiers(consent) {
  if (!consent || (!consent.statistiques && !consent.marketing)) return
  import('@/pages/vitrine/espaceClientApi').then(({ getConfigPublique }) =>
    getConfigPublique().then(({ data }) =>
      import('@/utils/gxtTracking').then(({ initAnalyticsTiers }) =>
        initAnalyticsTiers(
          { analytics_consent: !!consent.statistiques, marketing_consent: !!consent.marketing },
          data?.analytics || {}
        ))))
    .catch(() => {})
}

function ToggleCookie({ checked, disabled, onChange }) {
  return (
    <label className={cn('relative inline-block w-[42px] h-6 flex-none', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} className="peer sr-only" />
      <span className={cn('absolute inset-0 rounded-full transition',
        disabled ? 'bg-primary/50' : 'bg-edge peer-checked:bg-primary')} />
      <span className="absolute left-[3px] top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition peer-checked:translate-x-[18px]" />
    </label>
  )
}

function VitrineCookies() {
  const { t } = useTranslation()
  const [show, setShow] = useState(() => !lireConsentCookies())
  const [panel, setPanel] = useState(false)
  // Point 126 (conformité APDP) : consentement ACTIF (opt-in) — tout est décoché par
  // défaut sauf Essentiels ; l'utilisateur active explicitement ce qu'il autorise.
  // Le bandeau reste affiché tant qu'aucun choix n'a été enregistré.
  const [choix, setChoix] = useState({ preferences: false, personnalisation: false, statistiques: false, marketing: false })

  // Choix déjà mémorisé lors d'une visite précédente : activer les tiers consentis.
  useEffect(() => { appliquerConsentTiers(lireConsentCookies()) }, [])

  if (!show) return null

  const enregistrer = (v) => {
    try { localStorage.setItem('gx_cookie_consent', JSON.stringify({ v: 2, ...v })) } catch { /* indisponible */ }
    appliquerConsentTiers(v)
    setShow(false)
  }
  const tous = (val) => Object.fromEntries(CATS_COOKIES.map((c) => [c, val]))

  const CATS = [
    { cle: 'essentiels', icone: Lock, fixe: true },
    { cle: 'preferences', icone: Settings2 },
    { cle: 'personnalisation', icone: Sparkles },
    { cle: 'statistiques', icone: BarChart3 },
    { cle: 'marketing', icone: Megaphone },
  ]

  return (
    <>
      {/* Bandeau compact */}
      <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4">
        <div className="max-w-[1180px] mx-auto bg-card border border-edge rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-center gap-3">
          <CookieIcon size={20} className="text-primary flex-none hidden sm:block" />
          <p className="text-[13px] text-dim flex-1">{t('vitrine.cookies.text')}</p>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <button onClick={() => enregistrer(tous(false))} className="text-[13px] font-semibold px-3.5 py-2 rounded-[10px] border border-edge text-dim hover:text-ink transition">{t('vitrine.cookies.refuse')}</button>
            <button onClick={() => setPanel(true)} className="text-[13px] font-semibold px-3.5 py-2 rounded-[10px] border border-primary text-primary hover:bg-primary-50 transition">{t('vitrine.cookies.personnaliser')}</button>
            <button onClick={() => enregistrer(tous(true))} className="text-[13px] font-semibold px-3.5 py-2 rounded-[10px] bg-primary text-inverse hover:bg-primary-600 transition">{t('vitrine.cookies.accept')}</button>
          </div>
        </div>
      </div>

      {/* Panneau complet « Personnaliser » */}
      {panel && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setPanel(false)}>
          <div className="bg-card border border-edge rounded-2xl w-full max-w-[640px] max-h-[88vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-5 pb-4 border-b border-edge relative">
              <button onClick={() => setPanel(false)} aria-label="Fermer" className="absolute top-4 right-4 p-1.5 rounded-full border border-edge text-dim hover:text-ink"><X size={14} /></button>
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-primary mb-1">{t('vitrine.cookies.panel_eyebrow')}</p>
              <h2 className="font-display font-bold text-lg text-ink">{t('vitrine.cookies.panel_titre')}</h2>
              <p className="text-[13px] text-dim mt-1.5">{t('vitrine.cookies.panel_desc')}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {CATS.map(({ cle, icone: Icone, fixe }) => (
                <div key={cle} className="py-4 border-b border-edge last:border-b-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <Icone size={16} className="text-primary flex-none" />
                      <span className="font-semibold text-[14px] text-ink">{t(`vitrine.cookies.cat_${cle}`)}</span>
                      {fixe && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-subtle text-dim">{t('vitrine.cookies.toujours_actifs')}</span>}
                    </div>
                    <ToggleCookie checked={fixe ? true : choix[cle]} disabled={fixe}
                                  onChange={(v) => setChoix((c) => ({ ...c, [cle]: v }))} />
                  </div>
                  <p className="text-[12.5px] text-dim leading-relaxed mt-2">{t(`vitrine.cookies.desc_${cle}`)}</p>
                </div>
              ))}
              <p className="text-[11.5px] text-ghost leading-relaxed py-3 border-t border-dashed border-edge">
                {t('vitrine.cookies.footnote')}
              </p>
            </div>

            <div className="p-4 border-t border-edge flex gap-2 flex-wrap">
              <button onClick={() => enregistrer(tous(false))} className="flex-1 min-w-[130px] text-[13px] font-semibold px-4 py-2.5 rounded-xl border border-edge text-dim hover:text-ink transition">{t('vitrine.cookies.refuse')}</button>
              <button onClick={() => enregistrer(choix)} className="flex-1 min-w-[130px] text-[13px] font-semibold px-4 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary-50 transition">{t('vitrine.cookies.enregistrer_choix')}</button>
              <button onClick={() => enregistrer(tous(true))} className="flex-1 min-w-[130px] text-[13px] font-semibold px-4 py-2.5 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition">{t('vitrine.cookies.accept')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function VitrineNavbar() {
  const { t } = useTranslation()
  const { ids: favIds } = useFavoris()
  const loc = useLocation()
  const [banniere, setBanniere] = useState(null)
  useEffect(() => { getBanniere().then(setBanniere).catch(() => {}) }, [])
  const promo = (banniere?.actif && banniere?.texte) ? banniere : null
  return (
    <>
      <div data-theme="dark" className="text-center text-[13px] py-2 px-10 bg-inset text-ink">
        {promo
          ? (promo.lien
              ? <a href={promo.lien} target="_blank" rel="noopener noreferrer" className="hover:underline">{promo.texte}</a>
              : promo.texte)
          : <><span className="text-primary">✦</span>{' '}{t('vitrine.promo_a')}{' '}<span className="font-bold text-primary">Gextimo</span>{' '}{t('vitrine.promo_b')}</>}
      </div>
      <header className="sticky top-0 z-40 bg-app border-b border-edge">
        <div className="max-w-[1180px] mx-auto pl-4 pr-2 sm:px-5 h-[68px] grid grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-6">
          {/* Logo */}
          <Link to="/" aria-label="Gextimo"><VitrineLogo /></Link>

          {/* Nav centré */}
          <nav className="hidden lg:flex items-center justify-center gap-7">
            <a href="/#how" className="text-sm text-dim hover:text-ink whitespace-nowrap">{t('vitrine.nav.how')}</a>
            <Link to="/createurs" aria-current={loc.pathname.startsWith('/createurs') ? 'page' : undefined} className="text-sm text-dim hover:text-ink whitespace-nowrap">{t('vitrine.nav.creators')}</Link>
            <Link to="/artisans" aria-current={loc.pathname === '/artisans' ? 'page' : undefined} className="text-sm text-dim hover:text-ink whitespace-nowrap">{t('vitrine.menu2.artisans')}</Link>
            <a href="/#gallery" className="text-sm text-dim hover:text-ink whitespace-nowrap">{t('vitrine.nav.collections')}</a>
            <Link to="/suivi" aria-current={loc.pathname === '/suivi' ? 'page' : undefined} className="text-sm text-dim hover:text-ink whitespace-nowrap">{t('vitrine.nav.suivi')}</Link>
            <Link to="/espace-client" aria-current={loc.pathname === '/espace-client' ? 'page' : undefined} className="text-sm text-dim hover:text-ink whitespace-nowrap">{t('vitrine.nav.espace_client')}</Link>
            <Link to="/aide" aria-current={loc.pathname === '/aide' ? 'page' : undefined} className="text-sm text-dim hover:text-ink whitespace-nowrap">{t('vitrine.menu2.support')}</Link>
          </nav>

          {/* Contrôles droite */}
          <div className="flex items-center gap-2.5">
            <Link to="/favoris" aria-label={t('vitrine.favoris.menu')} className="relative w-8 h-8 flex items-center justify-center rounded-[10px] border border-edge text-dim hover:text-primary hover:border-primary transition">
              <Heart size={15} />
              {favIds.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-primary text-inverse text-[9px] font-bold flex items-center justify-center tabular-nums">
                  {favIds.length > 9 ? '9+' : favIds.length}
                </span>
              )}
            </Link>
            <ThemeToggle />
            <LocaleMenu />
            <div className="hidden lg:block h-5 w-px bg-edge mx-1.5" />
            <Link to="/inscription" className="vt-btn-ghost hidden lg:inline-flex items-center justify-center font-semibold text-[13px] h-9 px-4 rounded-[10px] border border-edge text-ink hover:border-primary hover:text-primary">{t('vitrine.nav.signup')}</Link>
            <Link to="/login" className="vt-btn-primary hidden lg:inline-flex items-center justify-center font-semibold text-[13px] h-9 px-4 rounded-[10px] border border-transparent bg-primary text-inverse hover:bg-primary-600">{t('vitrine.nav.login')}</Link>
            <div className="lg:hidden mr-0.5">
              <NavMenu />
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

function FooterLink({ to, children }) {
  const cls = 'vt-foot-link text-[13.5px] mb-2.5 text-dim hover:text-ink'
  const isAnchor = to.startsWith('#') || to.includes('/#')
  return isAnchor
    ? <a href={to} className={cls}>{children}</a>
    : <Link to={to} className={cls}>{children}</Link>
}

export function VitrineFooter() {
  const { t } = useTranslation()
  const prm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cols = [
    { h: t('vitrine.footer.col_platform'), links: [
      { l: t('vitrine.nav.creators'), to: '/createurs' },
      { l: t('vitrine.nav.collections'), to: '/#gallery' },
      { l: t('vitrine.nav.how'), to: '/#how' },
      { l: t('vitrine.nav.suivi'), to: '/suivi' },
    ] },
    { h: t('vitrine.footer.col_company'), links: [
      { l: t('vitrine.menu2.about'), to: '/qui-sommes-nous' },
      { l: t('vitrine.menu2.artisans'), to: '/artisans' },
      { l: t('vitrine.partenaires.footer_link'), to: '/partenaires' },
      { l: t('vitrine.footer.pricing'), to: '/premium' },
      { l: t('vitrine.sponsor.footer_link'), to: '/mise-en-avant' },
      { l: t('vitrine.menu2.support'), to: '/aide' },
      { l: t('vitrine.patron.recuperer_title'), to: '/patrons/recuperer' },
    ] },
    { h: t('vitrine.footer.col_legal'), links: [
      { l: t('vitrine.footer.legal_privacy'), to: '/confidentialite' },
      { l: t('vitrine.footer.legal_mentions'), to: '/mentions-legales' },
      { l: t('vitrine.footer.legal_cookies'), to: '/cookies' },
      { l: t('vitrine.footer.legal_apdp'), to: '/protection-donnees' },
      { l: t('vitrine.footer.legal_cgu'), to: '/cgu' },
    ] },
    { h: t('vitrine.footer.col_rules'), links: [
      { l: t('vitrine.footer.legal_creator_rights'), to: '/droits-createurs' },
      { l: t('vitrine.footer.legal_sale'), to: '/conditions-vente' },
      { l: t('vitrine.footer.legal_prohibited'), to: '/produits-interdits' },
      { l: t('vitrine.footer.legal_delivery'), to: '/livraison-retours' },
      { l: t('vitrine.footer.legal_community_rules'), to: '/regles-communaute' },
      { l: t('vitrine.footer.legal_contact'), to: '/contact-reclamations' },
    ] },
  ]
  return (
    <footer data-theme="dark" className="relative overflow-hidden isolate bg-inset text-ink pt-14 pb-6 mt-2">
      {/* ── Fond animé multicouche — ambiance défilé ── */}
      <div className="vt-foot-bg" aria-hidden="true">
        {/* Couche 1 — Mesh wash */}
        <div className="vt-foot-mesh" />
        {/* Couche 2 — Rubans de soie (IDs ft- pour éviter collision avec le hero) */}
        <svg className="vt-foot-ribbons" viewBox="0 0 1220 640" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="vt-ft-sg1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#7A0606" stopOpacity="0" />
              <stop offset="28%"  stopColor="#D00B0B" stopOpacity="0.9" />
              <stop offset="48%"  stopColor="#E82A1E" stopOpacity="0.95" />
              <stop offset="70%"  stopColor="#7A0606" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#7A0606" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="vt-ft-sg2" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%"   stopColor="#A87F3E" stopOpacity="0" />
              <stop offset="40%"  stopColor="#E4C486" stopOpacity="0.9" />
              <stop offset="55%"  stopColor="#F7E4B8" stopOpacity="1" />
              <stop offset="72%"  stopColor="#CDA662" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#CDA662" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="vt-ft-sg3" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#E82A1E" stopOpacity="0" />
              <stop offset="50%"  stopColor="#FF6B60" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E82A1E" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="vt-ft-sheen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#F7E4B8" stopOpacity="0" />
              <stop offset="50%"  stopColor="#FBF0D4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F7E4B8" stopOpacity="0" />
            </linearGradient>
            <filter id="vt-ft-soft"><feGaussianBlur stdDeviation="1" /></filter>
          </defs>
          {/* Ruban rouge large */}
          <path fill="url(#vt-ft-sg1)" filter="url(#vt-ft-soft)" opacity="0.65"
            d="M-100,70 C160,10 380,150 630,95 S 980,15 1360,120 L1360,250 C980,150 720,235 630,225 S 350,275 -100,200 Z">
            {!prm && <animate attributeName="d" dur="28s" calcMode="spline" keyTimes="0;0.5;1" keySplines=".45,0,.55,1;.45,0,.55,1" repeatCount="indefinite"
              values="M-100,70 C160,10 380,150 630,95 S 980,15 1360,120 L1360,250 C980,150 720,235 630,225 S 350,275 -100,200 Z;M-100,110 C180,190 400,60 630,150 S 1000,210 1360,80 L1360,210 C1000,300 700,170 630,190 S 340,80 -100,150 Z;M-100,70 C160,10 380,150 630,95 S 980,15 1360,120 L1360,250 C980,150 720,235 630,225 S 350,275 -100,200 Z" />}
          </path>
          {/* Reflet satiné */}
          <path fill="none" stroke="url(#vt-ft-sheen)" strokeWidth="1.4" opacity="0.55" style={{ mixBlendMode: 'screen' }}
            d="M-100,135 C160,80 380,220 630,160 S 980,90 1360,185">
            {!prm && <animate attributeName="d" dur="28s" calcMode="spline" keyTimes="0;0.5;1" keySplines=".45,0,.55,1;.45,0,.55,1" repeatCount="indefinite"
              values="M-100,135 C160,80 380,220 630,160 S 980,90 1360,185;M-100,180 C180,275 400,130 630,220 S 1000,285 1360,145;M-100,135 C160,80 380,220 630,160 S 980,90 1360,185" />}
          </path>
          {/* Ruban or moyen */}
          <path fill="url(#vt-ft-sg2)" filter="url(#vt-ft-soft)" opacity="0.45" style={{ mixBlendMode: 'screen' }}
            d="M-100,420 C220,470 430,330 700,400 S 1040,480 1360,380 L1360,470 C1040,560 750,490 700,500 S 260,600 -100,520 Z">
            {!prm && <animate attributeName="d" dur="36s" calcMode="spline" keyTimes="0;0.5;1" keySplines=".45,0,.55,1;.45,0,.55,1" repeatCount="indefinite"
              values="M-100,420 C220,470 430,330 700,400 S 1040,480 1360,380 L1360,470 C1040,560 750,490 700,500 S 260,600 -100,520 Z;M-100,470 C240,360 420,520 700,440 S 1020,360 1360,500 L1360,590 C1020,480 760,570 700,560 S 300,470 -100,600 Z;M-100,420 C220,470 430,330 700,400 S 1040,480 1360,380 L1360,470 C1040,560 750,490 700,500 S 260,600 -100,520 Z" />}
          </path>
          {/* Ruban rouge fin */}
          <path fill="url(#vt-ft-sg3)" filter="url(#vt-ft-soft)" opacity="0.30"
            d="M-100,260 C200,230 420,310 660,260 S 1000,220 1360,280 L1360,320 C1000,270 680,300 660,300 S 240,270 -100,300 Z">
            {!prm && <animate attributeName="d" dur="20s" calcMode="spline" keyTimes="0;0.5;1" keySplines=".45,0,.55,1;.45,0,.55,1" repeatCount="indefinite"
              values="M-100,260 C200,230 420,310 660,260 S 1000,220 1360,280 L1360,320 C1000,270 680,300 660,300 S 240,270 -100,300 Z;M-100,300 C220,300 400,240 660,300 S 980,300 1360,240 L1360,285 C980,340 700,280 660,340 S 260,335 -100,340 Z;M-100,260 C200,230 420,310 660,260 S 1000,220 1360,280 L1360,320 C1000,270 680,300 660,300 S 240,270 -100,300 Z" />}
          </path>
        </svg>
        {/* Couche 3 — Lueurs radiales */}
        <div className="vt-foot-glows" />
        {/* Couche 4 — Reflet or diagonal */}
        <div className="vt-foot-shimmer" />
      </div>
      <div className="relative z-10 max-w-[1180px] mx-auto px-5">
        <div className="vt-reveal grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1.1fr_1.1fr] gap-x-6 gap-y-8 pb-9 border-b border-edge">
          <div className="col-span-2 md:col-span-1">
            <VitrineLogo onDark />
            <p className="text-[13px] mt-3.5 max-w-[280px] text-dim">{t('vitrine.footer.tagline')}</p>
          </div>
          {cols.map((c) => (
            <div key={c.h} className="flex flex-col">
              <h5 className="text-[12px] font-bold uppercase tracking-[0.1em] mb-3.5">{c.h}</h5>
              {c.links.map((l) => <FooterLink key={l.l} to={l.to}>{l.l}</FooterLink>)}
            </div>
          ))}
        </div>
        <div className="vt-reveal text-center pt-5 text-[12.5px] text-dim">
          <span className="font-display font-bold text-ink">Une solution Novafriq<span className="text-primary"> ·</span></span>{' '}
          {t('vitrine.footer.rights')}
        </div>
      </div>
    </footer>
  )
}

/* Popup de 1ère visite : choix langue + devise. */
function WelcomePopup() {
  const { t } = useTranslation()
  const { langue, setLangue } = useLang()
  const { devise, setDevise } = useDevise()
  const [open, setOpen] = useState(() => {
    try { return !localStorage.getItem(FIRST_VISIT_KEY) } catch { return false }
  })

  const close = () => {
    try { localStorage.setItem(FIRST_VISIT_KEY, '1') } catch { /* indisponible */ }
    setOpen(false)
  }

  if (!open) return null

  const langues = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English',  flag: '🇬🇧' },
  ]
  const devises = Object.keys(DEVISES)

  return (
    <div data-theme="dark" className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-app/80 backdrop-blur-sm">
      <div className="bg-card border border-edge rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
        <button onClick={close} aria-label="Fermer" className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-ghost hover:text-ink transition">
          <X size={16} />
        </button>

        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-4">
          <Globe size={22} className="text-primary" />
        </div>

        <h2 className="font-display font-bold text-xl text-ink text-center mb-1">{t('vitrine.welcome_popup.title')}</h2>
        <p className="text-sm text-dim text-center mb-5">{t('vitrine.welcome_popup.subtitle')}</p>

        <div className="mb-4">
          <p className="text-xs font-semibold text-ghost uppercase tracking-wider mb-2">{t('vitrine.welcome_popup.langue')}</p>
          <div className="flex gap-2">
            {langues.map((l) => (
              <button
                key={l.code}
                onClick={() => setLangue(l.code)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition',
                  langue === l.code ? 'border-primary bg-primary/5 text-primary' : 'border-edge text-dim hover:border-primary hover:text-primary',
                )}
              >
                <span>{l.flag}</span> {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-ghost uppercase tracking-wider mb-2">{t('vitrine.welcome_popup.devise')}</p>
          <div className="grid grid-cols-4 gap-1.5">
            {devises.map((d) => (
              <button
                key={d}
                onClick={() => setDevise(d)}
                className={cn(
                  'py-2 rounded-xl border text-xs font-bold transition',
                  devise === d ? 'border-primary bg-primary/5 text-primary' : 'border-edge text-dim hover:border-primary hover:text-primary',
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="text-[10.5px] text-ghost mt-1.5">{t('vitrine.welcome_popup.devise_hint')}</p>
        </div>

        <button
          onClick={close}
          className="w-full py-3 rounded-xl bg-primary text-inverse font-semibold text-sm hover:bg-primary-600 transition"
        >
          {t('vitrine.welcome_popup.cta')}
        </button>
      </div>
    </div>
  )
}

/* Brief 16/07 (pt 6) : habillage saisonnier local — overlay de ~2,5 s à l'ouverture,
   configuré par l'admin (périodes datées, visuels béninois). Affiché 1×/jour max. */
function SplashSaisonnier() {
  const [theme, setTheme] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let mort = false
    ;(async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/vitrine/splash-theme`)
        const t = await r.json()
        if (mort || !t || t.actif === false || !t.nom) return
        const cle = `gx_splash_${t.nom}_${new Date().toDateString()}`
        if (localStorage.getItem(cle)) return
        localStorage.setItem(cle, '1')
        setTheme(t)
        setVisible(true)
        setTimeout(() => setVisible(false), 2600)
      } catch { /* pas d'overlay si l'API est injoignable */ }
    })()
    return () => { mort = true }
  }, [])

  if (!theme) return null
  return (
    <div aria-hidden="true"
         className={'fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-app transition-opacity duration-500 ' + (visible ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      {theme.image_url && <img src={theme.image_url} alt="" className="max-w-[70vw] max-h-[50vh] object-contain rounded-2xl" />}
      {theme.texte && <p className="font-display text-[clamp(18px,3vw,28px)] text-ink text-center px-6">{theme.texte}</p>}
    </div>
  )
}

export default function VitrineShell({ children }) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
    )
    const observe = () => document.querySelectorAll('.vt-reveal:not(.in), .vt-stagger:not(.in)').forEach(el => io.observe(el))
    observe()
    const mo = new MutationObserver(observe)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [])
  return (
    <div className="min-h-dvh bg-app text-ink font-sans">
      <SplashSaisonnier />
      <VitrineNavbar />
      <main>{children}</main>
      <VitrineFooter />
      <VitrineCookies />
      <WelcomePopup />
      <ChatWidget />
    </div>
  )
}
