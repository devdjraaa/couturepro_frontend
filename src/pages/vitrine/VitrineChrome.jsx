import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon, Heart, Globe, X, Menu, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme, useLang } from '@/contexts'
import { cn } from '@/utils/cn'
import { useDevise, DEVISES } from './vitrineCurrency'
import { getBanniere } from './vitrineApi'

const FIRST_VISIT_KEY = 'gx_welcome_done'

/* Symbole orbital + wordmark (charte). */
export function VitrineLogo({ onDark = false }) {
  const ring = onDark ? '#FFFFFF' : 'var(--color-text-primary)'
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 100 100" className="w-8 h-8 shrink-0" aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="none" stroke={ring} strokeWidth="3.4" />
        <circle cx="50" cy="50" r="33" fill="none" stroke={ring} strokeWidth="2" opacity="0.45" />
        <circle cx="50" cy="50" r="21" fill="none" stroke={ring} strokeWidth="2" opacity="0.3" />
        <path d="M50 4 A46 46 0 0 1 96 50" fill="none" stroke="#D00B0B" strokeWidth="6.5" strokeLinecap="round" />
        <circle cx="50" cy="50" r="8" fill="#D00B0B" />
      </svg>
      <span className={`font-display font-extrabold text-[22px] tracking-tight ${onDark ? 'text-white' : 'text-ink'}`}>
        gextimo<span className="text-primary">.</span>
      </span>
    </span>
  )
}

/* Sélecteur de langue FR / EN (compact). */
function LangToggle() {
  const { langue, setLangue } = useLang()
  return (
    <div className="flex items-center rounded-[10px] border border-edge overflow-hidden text-[11px] font-bold">
      {['fr', 'en'].map((l) => (
        <button key={l} type="button" onClick={() => setLangue(l)}
                className={cn('px-2 py-1.5 transition', langue === l ? 'bg-primary text-white' : 'text-dim hover:text-ink')}>
          {l.toUpperCase()}
        </button>
      ))}
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

/* Sélecteur de devise (multidevise, taux indicatifs). */
function DeviseSelect() {
  const { devise, setDevise } = useDevise()
  return (
    <select value={devise} onChange={(e) => setDevise(e.target.value)} aria-label="Devise"
            className="text-[11px] font-bold bg-card border border-edge rounded-[10px] px-1.5 py-[7px] text-dim focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer">
      {Object.keys(DEVISES).map((k) => <option key={k} value={k}>{k}</option>)}
    </select>
  )
}

/* Bandeau cookies (consentement mémorisé). */
function VitrineCookies() {
  const { t } = useTranslation()
  const [show, setShow] = useState(() => {
    try { return !localStorage.getItem('gx_cookie_consent') } catch { return true }
  })
  if (!show) return null
  const close = (v) => {
    try { localStorage.setItem('gx_cookie_consent', v) } catch { /* indisponible */ }
    setShow(false)
  }
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4">
      <div className="max-w-[1180px] mx-auto bg-card border border-edge rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-center gap-3">
        <p className="text-[13px] text-dim flex-1">{t('vitrine.cookies.text')}</p>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => close('refused')} className="text-[13px] font-semibold px-3.5 py-2 rounded-[10px] border border-edge text-ink hover:border-primary hover:text-primary transition">{t('vitrine.cookies.refuse')}</button>
          <button onClick={() => close('accepted')} className="text-[13px] font-semibold px-3.5 py-2 rounded-[10px] bg-primary text-white hover:bg-primary-600 transition">{t('vitrine.cookies.accept')}</button>
        </div>
      </div>
    </div>
  )
}

export function VitrineNavbar() {
  const { t } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const { langue, setLangue } = useLang()
  const { devise, setDevise } = useDevise()
  const [banniere, setBanniere] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => { getBanniere().then(setBanniere).catch(() => {}) }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setDrawerOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const close = () => setDrawerOpen(false)
  const promo = (banniere?.actif && banniere?.texte) ? banniere : null

  const navLinks = [
    { label: t('vitrine.nav.how'),        href: '/#how',            anchor: true },
    { label: t('vitrine.nav.creators'),   to:   '/createurs' },
    { label: t('vitrine.menu2.artisans'), to:   '/artisans' },
    { label: t('vitrine.nav.collections'),href: '/#gallery',         anchor: true },
    { label: t('vitrine.nav.suivi'),      to:   '/suivi' },
    { label: t('vitrine.menu2.support'),  to:   '/aide' },
    { label: t('vitrine.menu2.about'),    to:   '/qui-sommes-nous' },
  ]

  return (
    <>
      <div className="text-center text-[13px] py-2 px-10 bg-[#0D0D0D] text-[#F8F5F0]">
        {promo
          ? (promo.lien
              ? <a href={promo.lien} target="_blank" rel="noopener noreferrer" className="hover:underline">{promo.texte}</a>
              : promo.texte)
          : t('vitrine.promo')}
      </div>

      <header className="sticky top-0 z-40 bg-app/90 backdrop-blur border-b border-edge">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-5">

          {/* ── Barre mobile (< sm) ── */}
          <div className="flex sm:hidden items-center h-16 gap-2">
            <Link to="/" aria-label="Gextimo"><VitrineLogo /></Link>
            <div className="ml-auto flex items-center gap-2">
              <Link to="/favoris" aria-label={t('vitrine.favoris.menu')}
                className="w-11 h-11 flex items-center justify-center rounded-[10px] border border-edge text-dim hover:text-primary hover:border-primary transition">
                <Heart size={18} />
              </Link>
              <Link to="/inscription"
                className="h-11 px-4 flex items-center font-semibold text-[13px] rounded-[10px] bg-primary text-white hover:bg-primary-600 transition">
                {t('vitrine.nav.signup')}
              </Link>
              <button type="button" aria-label="Ouvrir le menu" aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(true)}
                className="w-11 h-11 flex items-center justify-center rounded-[10px] border border-edge text-dim hover:text-ink transition">
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* ── Barre desktop (≥ sm) ── */}
          <div className="hidden sm:flex items-center h-16 gap-4">
            <Link to="/" aria-label="Gextimo"><VitrineLogo /></Link>
            <nav className="hidden lg:flex gap-5 ml-3">
              <a href="/#how" className="text-sm text-dim hover:text-ink transition">{t('vitrine.nav.how')}</a>
              <Link to="/createurs" className="text-sm text-dim hover:text-ink transition">{t('vitrine.nav.creators')}</Link>
              <Link to="/artisans" className="text-sm text-dim hover:text-ink transition">{t('vitrine.menu2.artisans')}</Link>
              <a href="/#gallery" className="text-sm text-dim hover:text-ink transition">{t('vitrine.nav.collections')}</a>
              <Link to="/suivi" className="text-sm text-dim hover:text-ink transition">{t('vitrine.nav.suivi')}</Link>
              <Link to="/aide" className="text-sm text-dim hover:text-ink transition">{t('vitrine.menu2.support')}</Link>
              <Link to="/qui-sommes-nous" className="text-sm text-dim hover:text-ink transition">{t('vitrine.menu2.about')}</Link>
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <Link to="/favoris" aria-label={t('vitrine.favoris.menu')}
                className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-edge text-dim hover:text-primary hover:border-primary transition">
                <Heart size={15} />
              </Link>
              <ThemeToggle />
              <DeviseSelect />
              <LangToggle />
              <Link to="/inscription"
                className="inline-flex items-center font-semibold text-[13px] px-3.5 py-2 rounded-[10px] border border-edge text-ink hover:border-primary hover:text-primary transition">
                {t('vitrine.nav.signup')}
              </Link>
              <Link to="/login"
                className="inline-flex items-center font-semibold text-[13px] px-3.5 py-2 rounded-[10px] bg-primary text-white hover:bg-primary-600 transition">
                {t('vitrine.nav.login')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Scrim (mobile only) ── */}
      <div
        aria-hidden="true"
        onClick={close}
        className={cn(
          'fixed inset-0 z-50 sm:hidden bg-[#0D0D0D]/60 backdrop-blur-sm transition-opacity duration-300',
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* ── Tiroir (mobile only) ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        className={cn(
          'fixed top-0 right-0 bottom-0 z-[51] sm:hidden w-[85vw] max-w-sm bg-card flex flex-col shadow-2xl transition-transform duration-300 ease-out',
          drawerOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* En-tête tiroir */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-edge shrink-0">
          <VitrineLogo />
          <button onClick={close} aria-label="Fermer le menu"
            className="w-10 h-10 flex items-center justify-center rounded-full text-ghost hover:text-ink transition">
            <X size={20} />
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

          {/* Bloc compte */}
          <div className="flex flex-col gap-2.5">
            <Link to="/inscription" onClick={close}
              className="flex items-center justify-center h-11 rounded-[10px] bg-primary text-white font-semibold text-[14px] hover:bg-primary-600 transition">
              {t('vitrine.nav.signup')}
            </Link>
            <Link to="/login" onClick={close}
              className="flex items-center justify-center h-11 rounded-[10px] border border-edge text-ink font-semibold text-[14px] hover:border-primary hover:text-primary transition">
              {t('vitrine.nav.login')}
            </Link>
          </div>

          <div className="border-t border-edge" />

          {/* Navigation */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-ghost mb-1">Navigation</p>
            <nav>
              {navLinks.map((l) =>
                l.anchor
                  ? <a key={l.label} href={l.href} onClick={close}
                      className="flex items-center justify-between py-3 text-[14px] text-dim hover:text-ink transition border-b border-edge last:border-b-0">
                      <span>{l.label}</span>
                      <ChevronRight size={15} className="text-ghost shrink-0" />
                    </a>
                  : <Link key={l.label} to={l.to} onClick={close}
                      className="flex items-center justify-between py-3 text-[14px] text-dim hover:text-ink transition border-b border-edge last:border-b-0">
                      <span>{l.label}</span>
                      <ChevronRight size={15} className="text-ghost shrink-0" />
                    </Link>
              )}
            </nav>
          </div>

          <div className="border-t border-edge" />

          {/* Préférences */}
          <div className="flex flex-col gap-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ghost">Préférences</p>

            {/* Langue */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-dim">Langue</span>
              <div className="flex rounded-[10px] border border-edge overflow-hidden text-[11px] font-bold">
                {['fr', 'en'].map((l) => (
                  <button key={l} type="button" onClick={() => setLangue(l)}
                    className={cn('px-3 py-2 transition', langue === l ? 'bg-primary text-white' : 'text-dim hover:text-ink')}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Devise */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-dim">Devise</span>
              <select value={devise} onChange={(e) => setDevise(e.target.value)} aria-label="Devise"
                className="text-[11px] font-bold bg-card border border-edge rounded-[10px] px-2 py-2 text-dim focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer">
                {Object.keys(DEVISES).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            {/* Thème */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-dim">Thème</span>
              <div className="flex rounded-[10px] border border-edge overflow-hidden text-[11px] font-bold">
                <button type="button" onClick={() => isDark && toggleTheme()}
                  className={cn('flex items-center gap-1.5 px-3 py-2 transition',
                    !isDark ? 'bg-subtle text-ink' : 'text-dim hover:text-ink')}>
                  <Sun size={12} /> Clair
                </button>
                <button type="button" onClick={() => !isDark && toggleTheme()}
                  className={cn('flex items-center gap-1.5 px-3 py-2 transition',
                    isDark ? 'bg-primary text-white' : 'text-dim hover:text-ink')}>
                  <Moon size={12} /> Sombre
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function FooterLink({ to, children }) {
  const cls = 'block text-[13.5px] mb-2.5 text-white/60 hover:text-white transition'
  const isAnchor = to.startsWith('#') || to.includes('/#')
  return isAnchor
    ? <a href={to} className={cls}>{children}</a>
    : <Link to={to} className={cls}>{children}</Link>
}

export function VitrineFooter() {
  const { t } = useTranslation()
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
      { l: 'Tarifs', to: '/premium' },
    ] },
    { h: t('vitrine.footer.col_support'), links: [
      { l: t('vitrine.menu2.support'), to: '/aide' },
    ] },
    { h: t('vitrine.footer.col_legal'), links: [
      { l: t('vitrine.footer.legal_mentions'), to: '#' },
      { l: t('vitrine.footer.legal_privacy'), to: '#' },
      { l: t('vitrine.footer.legal_cookies'), to: '#' },
    ] },
  ]
  return (
    <footer className="bg-[#0D0D0D] text-white pt-14 pb-6 mt-2">
      <div className="max-w-[1180px] mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-8 pb-9 border-b border-white/10">
          <div>
            <VitrineLogo onDark />
            <p className="text-[13px] mt-3.5 max-w-[280px] text-white/60">{t('vitrine.footer.tagline')}</p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <h5 className="text-[12px] font-bold uppercase tracking-[0.1em] mb-3.5">{c.h}</h5>
              {c.links.map((l) => <FooterLink key={l.l} to={l.to}>{l.l}</FooterLink>)}
            </div>
          ))}
        </div>
        <div className="text-center pt-5 text-[12.5px] text-white/55">
          <span className="font-display font-bold text-white">Une solution NovAfrique<span className="text-primary"> ·</span></span>{' '}
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0D0D0D]/60 backdrop-blur-sm">
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
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-600 transition"
        >
          {t('vitrine.welcome_popup.cta')}
        </button>
      </div>
    </div>
  )
}

export default function VitrineShell({ children }) {
  return (
    <div className="min-h-dvh bg-app text-ink font-sans">
      <VitrineNavbar />
      <main>{children}</main>
      <VitrineFooter />
      <VitrineCookies />
      <WelcomePopup />
    </div>
  )
}
