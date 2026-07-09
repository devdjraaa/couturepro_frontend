import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BottomSheet } from '@/components/ui'
import { useAuth } from '@/contexts'
import { useAccountType } from '@/hooks/useAccountType'
import { NAV_GROUPS } from './Sidebar'

/**
 * Menu mobile complet (onglet « Plus » de la barre du bas). Reprend les mêmes
 * groupes de navigation que la barre latérale du web, filtrés par type de compte
 * (designer) et rôle (propriétaire). Donne accès à Ma Vitrine, Caisse, Facturation,
 * Équipe, Galerie, Outils, etc. — introuvables autrement sur mobile.
 */
export default function MobileMenu({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { isDesigner } = useAccountType()

  const go = (to) => { onClose(); navigate(to) }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('nav.menu')}>
      <div className="p-2 pb-[calc(0.75rem+var(--safe-area-bottom))] max-h-[72vh] overflow-y-auto">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) =>
            (!item.proprietaire || user?.role === 'proprietaire') &&
            (!item.designerOnly || isDesigner),
          )
          if (items.length === 0) return null

          return (
            <div key={group.key} className="mb-2">
              {group.label && (
                <p className="px-3 pt-3 pb-1 text-2xs font-semibold text-ghost uppercase tracking-widest">
                  {group.label}
                </p>
              )}
              <div className="grid grid-cols-3 gap-1">
                {items.map(({ to, icon: Icon, key }) => (
                  <button
                    key={to}
                    type="button"
                    onClick={() => go(to)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-subtle active:scale-[0.97] transition-all"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-medium text-ink text-center leading-tight">
                      {t(`nav.${key}`)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </BottomSheet>
  )
}
