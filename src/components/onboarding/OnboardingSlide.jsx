import { cn } from '@/utils/cn'

const COLOR_MAP = {
  primary: 'bg-primary/10 text-primary',
  accent:  'bg-accent/10  text-accent-600',
  success: 'bg-success/10 text-success',
  terra:   'bg-terra-50   text-terra',
}

export default function OnboardingSlide({ icon: Icon, title, description, color = 'primary', className }) {
  return (
    <div className={cn('flex flex-col items-center text-center px-8 py-12', className)}>
      <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center mb-6', COLOR_MAP[color])}>
        <Icon size={40} />
      </div>
      <h2 className="text-xl font-bold font-display text-ink mb-3">{title}</h2>
      <p className="text-sm text-dim leading-relaxed">{description}</p>
    </div>
  )
}
