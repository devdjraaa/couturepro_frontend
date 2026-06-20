import { Link } from 'react-router-dom'

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

export function VitrineNavbar() {
  return (
    <>
      <div className="text-center text-[13px] py-2 px-10 bg-[#0D0D0D] text-[#F8F5F0]">
        ✦ <b className="text-white">Nouveau</b> — la vitrine Gextimo connecte les créateurs de mode africaine à toute l’Afrique de l’Ouest.
      </div>
      <header className="sticky top-0 z-40 bg-app/90 backdrop-blur border-b border-edge">
        <div className="max-w-[1180px] mx-auto px-5 h-16 flex items-center gap-4">
          <Link to="/" aria-label="Accueil"><VitrineLogo /></Link>
          <nav className="hidden md:flex gap-6 ml-3">
            <a href="/#how" className="text-sm text-dim hover:text-ink transition">Comment ça marche</a>
            <Link to="/createurs" className="text-sm text-dim hover:text-ink transition">Créateurs</Link>
            <a href="/#gallery" className="text-sm text-dim hover:text-ink transition">Collections</a>
            <Link to="/suivi" className="text-sm text-dim hover:text-ink transition">Suivi</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <Link to="/register" className="hidden sm:inline-flex items-center font-semibold text-[13px] px-3.5 py-2 rounded-[10px] border border-edge text-ink hover:border-primary hover:text-primary transition">S’inscrire</Link>
            <Link to="/login" className="inline-flex items-center font-semibold text-[13px] px-3.5 py-2 rounded-[10px] bg-primary text-white hover:bg-primary-600 transition">Se connecter</Link>
          </div>
        </div>
      </header>
    </>
  )
}

export function VitrineFooter() {
  const cols = [
    { h: 'Plateforme', links: ['Créateurs', 'Collections', 'Comment ça marche', 'Devenir créateur'] },
    { h: 'Entreprise', links: ['À propos', 'Qui sommes-nous', 'Blog', 'Partenaires'] },
    { h: 'Support & Légal', links: ['FAQ', 'Contact', 'Mentions légales', 'Paramètres cookies'] },
  ]
  return (
    <footer className="bg-[#0D0D0D] text-white pt-14 pb-6 mt-2">
      <div className="max-w-[1180px] mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8 pb-9 border-b border-white/10">
          <div>
            <VitrineLogo onDark />
            <p className="text-[13px] mt-3.5 max-w-[280px] text-white/60">
              La vitrine qui connecte créateurs, artisans et clients de la mode africaine.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <h5 className="text-[12px] font-bold uppercase tracking-[0.1em] mb-3.5">{c.h}</h5>
              {c.links.map((l) => (
                <a key={l} href="#" className="block text-[13.5px] mb-2.5 text-white/60 hover:text-white transition">{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="text-center pt-5 text-[12.5px] text-white/55">
          <span className="font-display font-bold text-white">Une solution NovAfrique<span className="text-primary"> ·</span></span>{' '}
          © 2026 Gextimo. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}

export default function VitrineShell({ children }) {
  return (
    <div className="min-h-dvh bg-app text-ink font-sans">
      <VitrineNavbar />
      <main>{children}</main>
      <VitrineFooter />
    </div>
  )
}
