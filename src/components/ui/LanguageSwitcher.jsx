import { useLang } from '@/contexts'

export default function LanguageSwitcher({ variant = 'pills' }) {
  const { langue, setLangue, languesDispo } = useLang()

  if (variant === 'select') {
    return (
      <select
        value={langue}
        onChange={e => setLangue(e.target.value)}
        className="text-sm bg-card border border-edge rounded-xl px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {languesDispo.map(l => (
          <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
        ))}
      </select>
    )
  }

  return (
    <div className="flex items-center gap-1 bg-subtle rounded-xl p-1">
      {languesDispo.map(l => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLangue(l.code)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            langue === l.code
              ? 'bg-card text-ink shadow-sm'
              : 'text-dim hover:text-ink'
          }`}
        >
          <span>{l.flag}</span>
          <span>{l.label}</span>
        </button>
      ))}
    </div>
  )
}
