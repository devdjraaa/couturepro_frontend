import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scissors, Users, ClipboardList, TrendingUp } from 'lucide-react'
import { OnboardingSlide } from '@/components/onboarding'
import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'

const SLIDES = [
  {
    icon: Scissors,
    color: 'primary',
    title: 'Bienvenue sur Couture Pro',
    description: 'Gérez votre atelier de couture facilement depuis votre téléphone.',
  },
  {
    icon: Users,
    color: 'accent',
    title: 'Vos clients, organisés',
    description: 'Enregistrez les mesures et commandes de chaque client en quelques secondes.',
  },
  {
    icon: ClipboardList,
    color: 'success',
    title: 'Suivez vos commandes',
    description: 'Statuts en temps réel, paiements et livraisons, tout est sous contrôle.',
  },
  {
    icon: TrendingUp,
    color: 'terra',
    title: 'Développez votre activité',
    description: 'Tableau de bord, statistiques et programme de fidélité pour fidéliser vos clients.',
  },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
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
          {isLast ? 'Commencer' : 'Suivant'}
        </Button>
        {!isLast && (
          <button
            onClick={() => navigate('/', { replace: true })}
            className="w-full text-sm text-dim py-2"
          >
            Passer
          </button>
        )}
      </div>
    </div>
  )
}
