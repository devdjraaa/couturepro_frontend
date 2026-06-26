import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Zap, Crown, Star } from 'lucide-react'
import VitrineShell from './VitrineChrome'
import { getPlans } from './vitrineApi'
import { cn } from '@/utils/cn'

const TIER_ICONS = [Star, Zap, Crown]

const FAQ = [
  { q: 'Puis-je changer de plan à tout moment ?', r: 'Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. La différence est calculée au prorata.' },
  { q: 'Le plan Free est-il vraiment gratuit ?', r: 'Oui, le plan Free est gratuit et sans engagement, sans carte bancaire. Vous passez à un plan payant uniquement quand vous le souhaitez.' },
  { q: 'Comment fonctionne la facturation annuelle ?', r: "La facturation annuelle est réglée en une seule fois et représente environ 2 mois offerts par rapport à la facturation mensuelle." },
  { q: 'Mes données sont-elles sécurisées ?', r: 'Oui, vos données sont chiffrées et sauvegardées quotidiennement.' },
]

// Normalise le config (peut arriver double-encodé depuis le seed).
function parseConfig(config) {
  if (!config) return {}
  if (typeof config === 'string') {
    try { return JSON.parse(config) } catch { return {} }
  }
  return config
}

// Bullets lisibles dérivés du config du plan (donc config-driven : éditer en
// admin met à jour la page sans toucher au code).
function featuresFromConfig(config) {
  const c = parseConfig(config)
  const nb = (v) => (v === null || v === undefined ? 'illimité' : v)
  const f = []
  if (c.max_creations_vitrine !== undefined) f.push(`${nb(c.max_creations_vitrine)} créations en vitrine`)
  f.push(c.visible_galerie ? 'Visible dans la galerie publique' : 'Profil accessible par lien direct')
  if (c.max_clients_par_mois !== undefined) f.push(`${nb(c.max_clients_par_mois)} clients / mois`)
  if (c.max_membres) f.push(`Équipe jusqu'à ${c.max_membres} membre${c.max_membres > 1 ? 's' : ''}`)
  if (c.export_pdf) f.push('Factures & devis PDF')
  if (c.photos_vip) f.push('Photos VIP')
  if (c.module_caisse) f.push('Module Caisse')
  if (c.multi_ateliers) f.push('Multi-ateliers')
  return f
}

// Regroupe les plans actifs par palier (free / atelier / master), avec leurs
// variantes mensuel / annuel.
function groupTiers(plans) {
  const tiers = {}
  for (const p of plans) {
    const tier = p.cle.replace(/_(mensuel|annuel)$/, '')
    const period = /_annuel$/.test(p.cle) ? 'annuel' : /_mensuel$/.test(p.cle) ? 'mensuel' : 'gratuit'
    if (!tiers[tier]) {
      tiers[tier] = { tier, label: (p.label || '').replace(/\s*(Mensuel|Annuel)$/i, '').trim(), variants: {} }
    }
    tiers[tier].variants[period] = p
  }
  return Object.values(tiers)
}

export default function PremiumPage() {
  const [periode, setPeriode] = useState('mensuel')
  const [plans, setPlans] = useState(null) // null = chargement

  useEffect(() => { getPlans().then((d) => setPlans(Array.isArray(d) ? d : [])).catch(() => setPlans([])) }, [])

  const tiers = useMemo(() => groupTiers(plans || []), [plans])
  const hasAnnuel = useMemo(() => tiers.some((t) => t.variants.annuel), [tiers])

  return (
    <VitrineShell>
      {/* Hero */}
      <section className="py-16 text-center px-5">
        <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary mb-3">Tarifs</div>
        <h1 className="font-display font-extrabold text-[clamp(28px,4vw,44px)] text-ink">Choisissez votre plan</h1>
        <p className="text-dim mt-2 max-w-lg mx-auto">Commencez gratuitement, passez à un plan payant quand vous êtes prêt. Pas d'engagement, résiliez à tout moment.</p>

        {hasAnnuel && (
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
                {p === 'annuel' && <span className="ml-1.5 text-[10px] font-bold bg-success/15 text-success px-1.5 py-0.5 rounded-full">2 mois offerts</span>}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Grille plans */}
      <section className="max-w-[1100px] mx-auto px-5 pb-16">
        {plans === null ? (
          <p className="text-center text-dim py-10">Chargement des offres…</p>
        ) : tiers.length === 0 ? (
          <p className="text-center text-dim py-10">Les offres seront bientôt disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tiers.map((t, i) => {
              const plan = t.variants[periode] ?? t.variants.gratuit ?? Object.values(t.variants)[0]
              if (!plan) return null
              const Icon = TIER_ICONS[i] ?? Star
              const prix = Number(plan.prix_xof) || 0
              const isFree = prix === 0
              const isRecommended = /recommand/i.test(plan.description_courte || '')
              const suffix = (plan.duree_jours >= 300) ? '/ an' : '/ mois'
              const features = featuresFromConfig(plan.config)
              return (
                <div
                  key={t.tier}
                  className={cn(
                    'relative bg-card border rounded-2xl p-7 flex flex-col',
                    isRecommended ? 'border-primary shadow-lg shadow-primary/10 md:scale-[1.02]' : 'border-edge',
                  )}
                >
                  {plan.description_courte && (
                    <span className={cn(
                      'absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap',
                      isRecommended ? 'bg-primary text-white' : 'bg-warning/20 text-warning border border-warning/30',
                    )}>
                      {plan.description_courte}
                    </span>
                  )}

                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', isRecommended ? 'bg-primary/10' : 'bg-subtle')}>
                    <Icon size={20} className={isRecommended ? 'text-primary' : 'text-dim'} />
                  </div>

                  <h3 className="font-display font-bold text-xl text-ink">{t.label}</h3>
                  <div className="mt-3 mb-1">
                    <span className="font-display font-extrabold text-3xl text-ink">
                      {isFree ? 'Gratuit' : prix.toLocaleString('fr-FR')}
                    </span>
                    {!isFree && <span className="text-dim text-sm ml-1">FCFA {suffix}</span>}
                  </div>
                  {!isFree && suffix === '/ an' && plan.prix_mensuel_equivalent_xof > 0 && (
                    <p className="text-xs text-success font-medium mb-3">soit {Number(plan.prix_mensuel_equivalent_xof).toLocaleString('fr-FR')} FCFA / mois</p>
                  )}

                  <ul className="mt-4 space-y-2.5 flex-1">
                    {features.map((ff) => (
                      <li key={ff} className="flex items-start gap-2 text-sm text-dim">
                        <Check size={14} className="text-primary shrink-0 mt-0.5" />
                        {ff}
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
                    {isFree ? 'Commencer gratuitement' : `Choisir ${t.label}`}
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {/* Essai gratuit */}
        <div className="mt-8 text-center">
          <p className="text-sm text-ghost">
            Pas encore convaincu ? Le plan <strong className="text-ink">Free est gratuit</strong>, sans carte bancaire.{' '}
            <Link to="/inscription" className="text-primary font-semibold hover:underline">Démarrer →</Link>
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
