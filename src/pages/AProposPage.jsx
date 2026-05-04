import { Scissors, Star, Shield, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/components/layout'

const VERSION = '1.0.0'

const FEATURES = [
  { icon: Scissors, titleKey: 'a_propos.features.commandes_titre', descKey: 'a_propos.features.commandes_desc' },
  { icon: Star,     titleKey: 'a_propos.features.fidelite_titre',  descKey: 'a_propos.features.fidelite_desc'  },
  { icon: Shield,   titleKey: 'a_propos.features.securite_titre',  descKey: 'a_propos.features.securite_desc'  },
  { icon: Zap,      titleKey: 'a_propos.features.rapide_titre',    descKey: 'a_propos.features.rapide_desc'    },
]

const MENTIONS = [
  ['developpe_par', 'equipe'],
  ['support_label', 'support_valeur'],
  ['politique_label', 'politique_valeur'],
]

export default function AProposPage() {
  const { t } = useTranslation()

  return (
    <AppLayout title={t('a_propos.titre')} showBack>
      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-3">
            <Scissors size={28} className="text-white" />
          </div>
          <p className="text-xl font-bold font-display text-ink">Couture Pro</p>
          <p className="text-sm text-dim mt-1">{t('a_propos.version', { version: VERSION })}</p>
        </div>

        <div className="bg-card border border-edge rounded-2xl p-4">
          <p className="text-sm text-content leading-relaxed">
            {t('a_propos.description')}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-3">{t('a_propos.fonctionnalites')}</h2>
          <div className="space-y-2">
            {FEATURES.map(f => (
              <div key={f.titleKey} className="bg-card border border-edge rounded-2xl p-4 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon size={15} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{t(f.titleKey)}</p>
                  <p className="text-xs text-dim mt-0.5">{t(f.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-edge rounded-2xl divide-y divide-edge text-sm">
          {MENTIONS.map(([labelKey, valueKey]) => (
            <div key={labelKey} className="flex justify-between px-4 py-3">
              <span className="text-dim">{t(`a_propos.${labelKey}`)}</span>
              <span className="text-ink font-medium text-right">{t(`a_propos.${valueKey}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
