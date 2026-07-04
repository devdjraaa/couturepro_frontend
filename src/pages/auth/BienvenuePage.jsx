import { useNavigate } from 'react-router-dom'
import { UserCircle, Image, ShoppingBag, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

const ETAPES = [
  { icon: UserCircle,  key: 'etape1' },
  { icon: Image,       key: 'etape2' },
  { icon: ShoppingBag, key: 'etape3' },
]

export default function BienvenuePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh bg-app app-background flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm space-y-8">

        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-ink tracking-tight">
            {t('bienvenue.titre')}
          </h1>
          <p className="mt-2 text-sm text-dim">{t('bienvenue.sous_titre')}</p>
        </div>

        {/* Étapes */}
        <div className="space-y-3">
          {ETAPES.map(({ icon: Icon, key }, i) => (
            <div
              key={key}
              className="flex items-start gap-3 bg-card border border-edge rounded-2xl p-4"
              style={{ boxShadow: '0 2px 12px -4px rgba(0,0,0,.30)' }}
            >
              {/* Numéro cerclé */}
              <div
                className="flex-none w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink text-sm flex items-center gap-2">
                  <Icon size={15} className="text-primary shrink-0" />
                  {t(`bienvenue.${key}_titre`)}
                </p>
                <p className="text-xs text-dim mt-0.5">{t(`bienvenue.${key}_desc`)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            iconRight={ArrowRight}
            onClick={() => navigate(ROUTES.PARAMETRES, { replace: true })}
          >
            {t('bienvenue.commencer')}
          </Button>
          <button
            onClick={() => navigate(ROUTES.DASHBOARD, { replace: true })}
            className="w-full text-sm text-ghost py-2 hover:text-dim transition-colors"
          >
            {t('bienvenue.passer')}
          </button>
        </div>
      </div>
    </div>
  )
}
