import { useNavigate } from 'react-router-dom'
import { UserCircle, Image, ShoppingBag } from 'lucide-react'
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
    <div className="min-h-dvh bg-app flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('bienvenue.titre')}</h1>
          <p className="mt-2 text-sm text-dim">{t('bienvenue.sous_titre')}</p>
        </div>

        <div className="space-y-4 text-left">
          {ETAPES.map(({ icon: Icon, key }, i) => (
            <div key={key} className="flex items-start gap-3 bg-card border border-edge rounded-xl p-4">
              <div className="flex-none w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink text-sm flex items-center gap-2">
                  <Icon size={16} /> {t(`bienvenue.${key}_titre`)}
                </p>
                <p className="text-xs text-dim mt-1">{t(`bienvenue.${key}_desc`)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Button className="w-full" onClick={() => navigate(ROUTES.PARAMETRES, { replace: true })}>
            {t('bienvenue.commencer')}
          </Button>
          <button
            onClick={() => navigate(ROUTES.DASHBOARD, { replace: true })}
            className="w-full text-sm text-dim py-2"
          >
            {t('bienvenue.passer')}
          </button>
        </div>
      </div>
    </div>
  )
}
