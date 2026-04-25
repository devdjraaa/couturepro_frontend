import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme } from '@/contexts'
import { useT } from '@/contexts'
import { AppLayout } from '@/components/layout'

const OPTIONS = [
  {
    key: 'light',
    icon: Sun,
    labelKey:  'theme.clair',
    descKey:   'theme.clair_description',
  },
  {
    key: 'dark',
    icon: Moon,
    labelKey:  'theme.sombre',
    descKey:   'theme.sombre_description',
  },
  {
    key: 'system',
    icon: Monitor,
    labelKey:  'theme.systeme',
    descKey:   'theme.systeme_description',
  },
]

export default function ThemePage() {
  const { theme, setTheme } = useTheme()
  const t = useT()

  return (
    <AppLayout showBack title={t('theme.titre')}>
      <div className="p-4 space-y-3">
        <p className="text-sm text-dim">{t('theme.sous_titre')}</p>

        <div className="space-y-2 pt-1">
          {OPTIONS.map(({ key, icon: Icon, labelKey, descKey }) => {
            const isActive = theme === key
            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={[
                  'w-full flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all text-left',
                  isActive
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'bg-card border-edge text-ink hover:bg-subtle',
                ].join(' ')}
              >
                <div className={[
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  isActive ? 'bg-primary text-inverse' : 'bg-subtle text-dim',
                ].join(' ')}>
                  <Icon size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{t(labelKey)}</p>
                  <p className={`text-xs mt-0.5 ${isActive ? 'text-primary/70' : 'text-ghost'}`}>
                    {t(descKey)}
                  </p>
                </div>

                {isActive && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check size={14} className="text-inverse" strokeWidth={2.5} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
