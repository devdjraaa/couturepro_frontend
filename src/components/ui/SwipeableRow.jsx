import { useRef, useState } from 'react'
import { cn } from '@/utils/cn'

const ACTION_WIDTH = 72 // px par action

export default function SwipeableRow({ children, actions = [], className }) {
  const [offset, setOffset]     = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(null)
  const maxOffset = actions.length * ACTION_WIDTH

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    setDragging(true)
  }

  const onTouchMove = (e) => {
    if (startX.current === null) return
    const dx = startX.current - e.touches[0].clientX
    setOffset(Math.max(0, Math.min(maxOffset, dx)))
  }

  const onTouchEnd = () => {
    setDragging(false)
    // Snap : ouvrir si > moitié, sinon fermer
    setOffset(offset > maxOffset / 2 ? maxOffset : 0)
  }

  const close = () => setOffset(0)

  if (actions.length === 0) return <div className={className}>{children}</div>

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Actions (révélées par le glissement) */}
      <div className="absolute inset-y-0 right-0 flex">
        {actions.map((action, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { close(); action.onClick() }}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-inverse transition-opacity',
              action.className ?? 'bg-danger',
            )}
            style={{ width: ACTION_WIDTH }}
          >
            {action.icon && <action.icon size={20} />}
            {action.label && <span className="text-xs font-medium">{action.label}</span>}
          </button>
        ))}
      </div>

      {/* Contenu principal */}
      <div
        className={cn('relative bg-card', !dragging && 'transition-transform duration-200')}
        style={{ transform: `translateX(-${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
