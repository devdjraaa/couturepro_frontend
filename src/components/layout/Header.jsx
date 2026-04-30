import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, ChevronDown, Building2, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts'
import { Avatar, LanguageSwitcher } from '@/components/ui'
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
    <div ref={ref} className="relative mt-0.5">
      <button
        onClick={() => setOpen(x => !x)}
        className="flex items-center gap-1 text-xs text-dim hover:text-ink px-2 py-0.5 rounded-full bg-subtle/60 transition-colors"
      >
        <Building2 size={10} className="shrink-0" />
        <span className="font-medium truncate max-w-36">{atelier?.nom ?? '—'}</span>
        <ChevronDown size={10} className="shrink-0" />
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
  )
}

export default function Header({ title, showBack = false, onBack, rightAction, className }) {
  const navigate = useNavigate()
  const { user, atelier, switchAtelier } = useAuth()
  const { data: notifCount = 0 } = useNotificationsCount()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-20 bg-card/80 backdrop-blur-sm border-b border-edge shrink-0 pt-safe',
        className,
      )}
    >
      <div className="flex items-center gap-3 px-4 h-14">

        {/* Back button */}
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-subtle transition-colors shrink-0 -ml-1"
          >
            <ArrowLeft size={20} className="text-ink" />
          </button>
        )}

        {/* Title + atelier switcher — left-aligned */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold font-display text-ink truncate leading-tight">
            {title ?? 'Couture Pro'}
          </h1>
          {user?.role === 'proprietaire' && atelier && (
            <AtelierSwitcher atelier={atelier} switchAtelier={switchAtelier} />
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          {rightAction && <div className="mr-1">{rightAction}</div>}
          <LanguageSwitcher variant="badge" />
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-subtle transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-dim" />
            {notifCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-warning rounded-full" />
            )}
          </button>
          {user && (
            <button
              type="button"
              onClick={() => navigate('/profil')}
              className="ml-1 rounded-full"
            >
              <Avatar name={user.nom} src={user.avatar} size="sm" />
            </button>
          )}
        </div>

      </div>
    </header>
  )
}
