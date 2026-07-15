import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, ChevronDown, Building2, CheckCircle2, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts'
import { Avatar } from '@/components/ui'
import { useNotificationsCount } from '@/hooks/useNotifications'
import { useMesAteliers } from '@/hooks/useMesAteliers'

function AtelierMaitreLabel() {
  const { t } = useTranslation()
  return <p className="text-2xs text-dim">{t('parametres.ateliers_tab.maitre')}</p>
}

function AtelierSwitcher({ atelier, switchAtelier }) {
  const { data: ateliers = [] } = useMesAteliers()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (ateliers.length <= 1) return null

  return (
    <div className="px-4 pb-2.5 -mt-1.5">
      <div ref={ref} className="relative inline-block">
        <button
          onClick={() => setOpen(x => !x)}
          className="flex items-center gap-1.5 text-xs text-inverse/85 hover:text-inverse pl-2.5 pr-2 py-1 rounded-full bg-inverse/20 hover:bg-inverse/25 transition-colors"
        >
          <Building2 size={12} className="shrink-0" />
          <span className="font-semibold truncate max-w-52">{atelier?.nom ?? '—'}</span>
          <ChevronDown size={12} className="shrink-0 opacity-80" />
        </button>

        {open && (
          <div className="absolute top-full mt-1 w-56 bg-card border border-edge rounded-xl shadow-lg z-50 overflow-hidden">
            {ateliers.map(a => (
              <button
                key={a.id}
                onClick={() => { switchAtelier(a); setOpen(false) }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left hover:bg-subtle transition-colors"
              >
                <Building2 size={13} className="text-dim shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{a.nom}</p>
                  {a.is_maitre && <AtelierMaitreLabel />}
                </div>
                {a.id === atelier?.id && <CheckCircle2 size={13} className="text-primary shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Header({ title, showBack = false, onBack, rightAction, onSearch, className }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, atelier, switchAtelier } = useAuth()
  const { data: notifCount = 0 } = useNotificationsCount()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-20 shrink-0 pt-safe',
        className,
      )}
      style={{
        background: 'linear-gradient(160deg, var(--color-primary-300, #F5443A) 0%, var(--color-primary, #E82A1E) 45%, var(--color-primary-700, #8E0B03) 100%)',
        boxShadow: '0 4px 24px -8px rgba(180,20,10,.40)',
      }}
    >
      <div className="flex items-center gap-3 px-4 h-14">

        {/* Back button */}
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-inverse/10 transition-colors shrink-0 -ml-1"
          >
            <ArrowLeft size={20} className="text-inverse" />
          </button>
        )}

        {/* Title — single line */}
        <h1 className="flex-1 min-w-0 text-base font-bold font-display text-white truncate leading-tight tracking-tight">
          {title ?? 'Gextimo'}
        </h1>

        {/* Right actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          {rightAction && <div className="mr-1">{rightAction}</div>}
          {onSearch && (
            <button
              type="button"
              onClick={onSearch}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-inverse/10 transition-colors"
              aria-label={t('commun.rechercher')}
            >
              <Search size={18} className="text-inverse" />
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-inverse/10 transition-colors"
            aria-label={t('nav.notifications')}
          >
            <Bell size={20} className="text-inverse" />
            {notifCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-warning rounded-full" />
            )}
          </button>
          {user && (
            <button
              type="button"
              onClick={() => navigate('/parametres/profil')}
              className="ml-1 rounded-full"
            >
              <Avatar name={user.nom} src={user.avatar} size="sm" />
            </button>
          )}
        </div>

      </div>

      {/* Sélecteur d'atelier — 2ᵉ rangée, seulement en multi-atelier (sinon null) */}
      {user?.role === 'proprietaire' && atelier && (
        <AtelierSwitcher atelier={atelier} switchAtelier={switchAtelier} />
      )}
    </header>
  )
}
