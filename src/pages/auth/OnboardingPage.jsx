import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scissors, Users, ClipboardList, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { OnboardingSlide } from '@/components/onboarding'
import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)

  const SLIDES = [
    { icon: Scissors,     color: 'primary', title: t('auth.onboarding.slide_1_titre'), description: t('auth.onboarding.slide_1_description') },
    { icon: Users,        color: 'accent',  title: t('auth.onboarding.slide_2_titre'), description: t('auth.onboarding.slide_2_description') },
    { icon: ClipboardList,color: 'success', title: t('auth.onboarding.slide_3_titre'), description: t('auth.onboarding.slide_3_description') },
    { icon: TrendingUp,   color: 'terra',   title: t('auth.onboarding.slide_4_titre'), description: t('auth.onboarding.slide_4_description') },
  ]
  const isLast = index === SLIDES.length - 1

  const next = () => {
    if (isLast) navigate('/', { replace: true })
    else setIndex(i => i + 1)
  }

  return (
    <div className="min-h-dvh bg-app flex flex-col items-center justify-between py-12 px-4">
      <div className="flex-1 flex items-center w-full max-w-sm">
        <OnboardingSlide {...SLIDES[index]} className="w-full" />
      </div>

      <div className="flex gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === index ? 'w-6 bg-primary' : 'w-2 bg-edge',
            )}
          />
        ))}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Button className="w-full" onClick={next}>
          {isLast ? t('auth.onboarding.commencer') : t('commun.suivant')}
        </Button>
        {!isLast && (
          <button
            onClick={() => navigate('/', { replace: true })}
            className="w-full text-sm text-dim py-2"
          >
            {t('auth.onboarding.passer')}
          </button>
        )}
      </div>
    </div>
  )
}
