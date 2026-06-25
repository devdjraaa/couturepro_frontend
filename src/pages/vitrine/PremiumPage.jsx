import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Zap, Crown, Star } from 'lucide-react'
import VitrineShell from './VitrineChrome'
import { cn } from '@/utils/cn'

const PLANS = [
  {
    id: 'starter',
    icon: Star,
    nom: 'Starter',
    prix: { mensuel: 2500, annuel: 25000 },
    couleur: 'text-dim',
    badge: null,
    features: [
      '10 clients',
      '20 commandes / mois',
      'Vitrine publique',
      'Suivi commandes',
      'Support standard',
    ],
  },
  {
    id: 'pro',
    icon: Zap,
    nom: 'Pro',
    prix: { mensuel: 5000, annuel: 50000 },
    couleur: 'text-primary',
    badge: 'Recommandé',
    features: [
      '50 clients',
      '100 commandes / mois',
      'Vitrine publique + badge Vérifié',
      'CRM avancé & historique complet',
      'Facturation & devis PDF',
      "Gestion d'équipe",
      'Support prioritaire',
    ],
  },
  {
    id: 'magnat',
    icon: Crown,
    nom: 'Magnat',
    prix: { mensuel: 10000, annuel: 100000 },
    couleur: 'text-warning',
    badge: 'Tout inclus',
    features: [
      'Clients & commandes illimités',
      'Multi-ateliers',
      'Mise en avant sponsorisée incluse',
      'Module Caisse complet',
      'Accès API partenaires',
      'Manager dédié',
      'Support 24 h / 7 j',
    ],
  },
]

const FAQ = [
  { q: 'Puis-je changer de plan à tout moment ?', r: 'Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. La différence est calculée au prorata.' },
  { q: 'Y a-t-il une période d\'essai ?', r: 'Oui, 14 jours d\'essai gratuit sur le plan Pro sans carte bancaire requise.' },
  { q: 'Comment fonctionne la facturation annuelle ?', r: 'La facturation annuelle est réglée en une seule fois et représente une économie d\'environ 2 mois par rapport à la facturation mensuelle.' },
  { q: 'Mes données sont-elles sécurisées ?', r: 'Oui, toutes vos données sont hébergées en France, chiffrées et sauvegardées quotidiennement.' },
]

export default function PremiumPage() {
  const [periode, setPeriode] = useState('mensuel')

  const economie = (plan) => {
    const diff = plan.prix.mensuel * 12 - plan.prix.annuel
    return diff > 0 ? diff : 0
  }

  return (
    <VitrineShell>
      {/* Hero */}
      <section className="py-16 text-center px-5">
        <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary mb-3">Tarifs</div>
        <h1 className="font-display font-extrabold text-[clamp(28px,4vw,44px)] text-ink">Choisissez votre plan</h1>
        <p className="text-dim mt-2 max-w-lg mx-auto">Commencez gratuitement, passez à Pro quand vous êtes prêt. Pas d'engagement, résiliez à tout moment.</p>

        {/* Toggle mensuel / annuel */}
        <div className="inline-flex items-center gap-1 mt-6 bg-subtle border border-edge rounded-xl p-1">
          {['mensuel', 'annuel'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              className={cn(
                'px-4 py-2 rounded-[10px] text-sm font-semibold transition',
                periode === p ? 'bg-primary text-white' : 'text-ghost hover:text-ink',
              )}
            >
              {p === 'mensuel' ? 'Mensuel' : 'Annuel'}
              {p === 'annuel' && <span className="ml-1.5 text-[10px] font-bold bg-success/15 text-success px-1.5 py-0.5 rounded-full">–17 %</span>}
            </button>
          ))}
        </div>
      </section>

      {/* Grille plans */}
      <section className="max-w-[1100px] mx-auto px-5 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const prix = plan.prix[periode]
            const Icon = plan.icon
            const isRecommended = plan.id === 'pro'
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative bg-card border rounded-2xl p-7 flex flex-col',
                  isRecommended ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]' : 'border-edge',
                )}
              >
                {plan.badge && (
                  <span className={cn(
                    'absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full',
                    isRecommended ? 'bg-primary text-white' : 'bg-warning/20 text-warning border border-warning/30',
                  )}>
                    {plan.badge}
                  </span>
                )}

                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', isRecommended ? 'bg-primary/10' : 'bg-subtle')}>
                  <Icon size={20} className={plan.couleur} />
                </div>

                <h3 className="font-display font-bold text-xl text-ink">{plan.nom}</h3>
                <div className="mt-3 mb-1">
                  <span className="font-display font-extrabold text-3xl text-ink">
                    {prix.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-dim text-sm ml-1">FCFA / mois</span>
                </div>
                {periode === 'annuel' && economie(plan) > 0 && (
                  <p className="text-xs text-success font-medium mb-3">Économie de {economie(plan).toLocaleString('fr-FR')} FCFA / an</p>
                )}

                <ul className="mt-4 space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-dim">
                      <Check size={14} className="text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/inscription"
                  className={cn(
                    'mt-6 w-full py-3 rounded-xl font-semibold text-sm text-center transition',
                    isRecommended
                      ? 'bg-primary text-white hover:bg-primary-600'
                      : 'border border-edge text-ink hover:border-primary hover:text-primary',
                  )}
                >
                  Commencer avec {plan.nom}
                </Link>
              </div>
            )
          })}
        </div>

        {/* Essai gratuit */}
        <div className="mt-8 text-center">
          <p className="text-sm text-ghost">
            Pas encore convaincu ? Essayez <strong className="text-ink">14 jours gratuits</strong> sans carte bancaire.{' '}
            <Link to="/inscription" className="text-primary font-semibold hover:underline">Démarrer l'essai →</Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[720px] mx-auto px-5 pb-20">
        <h2 className="font-display font-bold text-2xl text-ink text-center mb-8">Questions fréquentes</h2>
        <div className="space-y-4">
          {FAQ.map(({ q, r }) => (
            <div key={q} className="bg-card border border-edge rounded-xl p-5">
              <p className="font-semibold text-ink mb-1.5">{q}</p>
              <p className="text-sm text-dim leading-relaxed">{r}</p>
            </div>
          ))}
        </div>
      </section>
    </VitrineShell>
  )
}
