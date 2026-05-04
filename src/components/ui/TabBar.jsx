import { cn } from '@/utils/cn'

export default function TabBar({ tabs = [], activeTab, onChange, className }) {
  return (
    <div className={cn('flex border-b border-edge overflow-x-auto scrollbar-none', className)}>
      {tabs.map(tab => {
        const isActive = tab.key === activeTab
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              'shrink-0 px-4 py-2.5 text-sm font-medium font-sans',
              'border-b-2 -mb-px transition-all duration-150',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-dim hover:text-ink hover:border-edge',
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium',
                isActive ? 'bg-primary/10 text-primary' : 'bg-subtle text-ghost',
              )}>
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
