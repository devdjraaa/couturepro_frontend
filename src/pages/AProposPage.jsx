import { Scissors, Star, Shield, Zap } from 'lucide-react'
import { AppLayout } from '@/components/layout'

const VERSION = '1.0.0'

const FEATURES = [
  { icon: Scissors, title: 'Gestion des commandes', desc: 'Suivez toutes vos commandes de la prise de mesures à la livraison.' },
  { icon: Star,     title: 'Fidélité client',       desc: 'Accumulez des points et offrez des bonus à vos meilleurs clients.' },
  { icon: Shield,   title: 'Sécurisé',              desc: 'Vos données sont stockées de façon sécurisée et sauvegardées.' },
  { icon: Zap,      title: 'Rapide',                desc: 'Interface conçue pour les artisans — simple, rapide, efficace.' },
]

export default function AProposPage() {
  return (
    <AppLayout title="À propos" showBack>
      <div className="p-4 space-y-6">
        {/* Logo + version */}
        <div className="flex flex-col items-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-3">
            <Scissors size={28} className="text-white" />
          </div>
          <p className="text-xl font-bold font-display text-ink">Couture Pro</p>
          <p className="text-sm text-dim mt-1">Version {VERSION}</p>
        </div>

        {/* Description */}
        <div className="bg-card border border-edge rounded-2xl p-4">
          <p className="text-sm text-content leading-relaxed">
            Couture Pro est l'application de gestion dédiée aux ateliers de couture. Elle vous permet de gérer vos clients,
            leurs mesures, vos commandes et votre équipe depuis votre téléphone.
          </p>
        </div>

        {/* Fonctionnalités clés */}
        <div>
          <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-3">Fonctionnalités</h2>
          <div className="space-y-2">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-card border border-edge rounded-2xl p-4 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon size={15} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{f.title}</p>
                  <p className="text-xs text-dim mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mentions légales */}
        <div className="bg-card border border-edge rounded-2xl divide-y divide-edge text-sm">
          {[
            ['Développé par', 'Équipe CouturePro'],
            ['Support', 'support@couturepro.app'],
            ['Politique de confidentialité', 'couturepro.app/privacy'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between px-4 py-3">
              <span className="text-dim">{label}</span>
              <span className="text-ink font-medium text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
