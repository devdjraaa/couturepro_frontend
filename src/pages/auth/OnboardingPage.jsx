import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scissors, Users, ClipboardList, TrendingUp, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { OnboardingSlide } from '@/components/onboarding'
import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants/routes'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)

  const SLIDES = [
    { icon: Scissors,      color: 'primary', title: t('auth.onboarding.slide_1_titre'), description: t('auth.onboarding.slide_1_description') },
    { icon: Users,         color: 'accent',  title: t('auth.onboarding.slide_2_titre'), description: t('auth.onboarding.slide_2_description') },
    { icon: ClipboardList, color: 'success', title: t('auth.onboarding.slide_3_titre'), description: t('auth.onboarding.slide_3_description') },
    { icon: TrendingUp,    color: 'terra',   title: t('auth.onboarding.slide_4_titre'), description: t('auth.onboarding.slide_4_description') },
  ]
  const isLast = index === SLIDES.length - 1

  const next = () => {
    if (isLast) navigate(ROUTES.BIENVENUE, { replace: true })
    else setIndex(i => i + 1)
  }

  return (
    <div className="min-h-dvh bg-app app-background flex flex-col items-center justify-between py-12 px-5">

      {/* Slide */}
      <div className="flex-1 flex items-center w-full max-w-sm">
        <OnboardingSlide {...SLIDES[index]} className="w-full" />
      </div>

      {/* Indicateurs */}
      <div className="flex gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i === index ? '1.5rem' : '0.5rem',
              background: i === index ? 'var(--color-primary)' : 'var(--color-border-edge)',
            }}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <Button size="lg" className="w-full" iconRight={ArrowRight} onClick={next}>
          {isLast ? t('auth.onboarding.commencer') : t('commun.suivant')}
        </Button>
        {!isLast && (
          <button
            onClick={() => navigate(ROUTES.DASHBOARD, { replace: true })}
            className="w-full text-sm text-ghost py-2 hover:text-dim transition-colors"
          >
            {t('auth.onboarding.passer')}
          </button>
        )}
      </div>
    </div>
  )
}
