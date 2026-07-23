import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Zap, Crown, Star, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { getPlans, getTarification } from './vitrineApi'
import { usePageMeta } from '@/hooks/usePageMeta'
import { cn } from '@/utils/cn'
import { featuresFromConfig } from '@/utils/planFeatures'

const TIER_ICONS = [Star, Zap, Crown]

// Les plans sont volontairement PARTAGÉS entre les deux types de compte : mêmes
// paliers, mêmes prix. Ce qui diffère, c'est ce dont on se sert — un artisan ne
// publie pas de vitrine et ne gère pas plusieurs ateliers. Le tri des lignes
// vit dans `planFeatures`, partagé avec l'offre d'abonnement de l'application.

// Regroupe les plans actifs par palier (free / atelier / master), avec leurs
// variantes mensuel / annuel.
function groupTiers(plans) {
  const tiers = {}
  for (const p of plans) {
    const tier = p.cle.replace(/_(mensuel|annuel)$/, '')
    const period = /_annuel$/.test(p.cle) ? 'annuel' : /_mensuel$/.test(p.cle) ? 'mensuel' : 'gratuit'
    if (!tiers[tier]) {
      tiers[tier] = {
        tier,
        label: (p.label || '').replace(/\s*(Mensuel|Annuel)$/i, '').trim(),
        labelEn: (p.label_en || '').replace(/\s*(Monthly|Yearly)$/i, '').trim(),
        variants: {},
      }
    }
    tiers[tier].variants[period] = p
  }
  return Object.values(tiers)
}

export default function PremiumPage() {
  const { t, i18n } = useTranslation()
  usePageMeta({ title: t('premium.titre'), description: t('premium.sous_titre'), path: '/premium' })
  const [periode, setPeriode] = useState('mensuel')
  const [type, setType] = useState('designer')
  const [plans, setPlans] = useState(null) // null = chargement
  const [reglages, setReglages] = useState(null)

  useEffect(() => {
    getPlans().then((d) => setPlans(Array.isArray(d) ? d : [])).catch(() => setPlans([]))
    // Une présentation indisponible ne doit pas vider la page : la grille
    // s'affiche sans badge ni encart plutôt que pas du tout.
    getTarification().then(setReglages).catch(() => setReglages({}))
  }, [])

  const tiers = useMemo(() => groupTiers(plans || []), [plans])
  const hasAnnuel = useMemo(() => tiers.some((ti) => ti.variants.annuel), [tiers])
  const faq = t('premium.faq', { returnObjects: true })

  const enAnglais = (i18n.language || 'fr').startsWith('en')

  /** Un texte bilingue du back-office. Traduction vide → français. */
  const bi = (v) => (typeof v === 'object' && v !== null ? (enAnglais ? (v.en || v.fr) : v.fr) : v) || ''

  const r = reglages || {}
  const typesActif = r.types_actif !== false && !!r.type_artisan
  const planPopulaire = r.plan_populaire || ''

  /**
   * L'essai offert : l'argument de vente le plus fort, et il n'était annoncé
   * NULLE PART. Tout nouveau compte reçoit d'emblée un plan payant pendant
   * cette durée. Le nombre de jours vient du back-office — c'est la même
   * valeur que celle réellement accordée à l'inscription, donc la page ne peut
   * pas promettre autre chose que ce qui est appliqué.
   */
  const essaiActif = r.essai_actif !== false && Number(r.essai_jours) > 0
  const essaiJours = Number(r.essai_jours) || 0
  const avecJours = (v) => bi(v).replace(/\{jours\}/g, essaiJours)

  return (
    <VitrineShell>
      {/* Hero */}
      <section className="py-16 text-center px-5">
        <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary mb-3">{t('premium.tag')}</div>
        <h1 className="font-display font-extrabold text-[clamp(28px,4vw,44px)] text-ink">{t('premium.titre')}</h1>
        <p className="text-dim mt-2 max-w-lg mx-auto">{t('premium.sous_titre')}</p>

        {/* Essai offert — annoncé AVANT les prix : un visiteur qui voit
            « 2 500 FCFA » avant de savoir qu'il peut essayer sans payer part
            plus vite. */}
        {essaiActif && (
          <div className="mt-6 inline-flex flex-col items-center gap-1.5 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-3.5 max-w-lg mx-auto">
            <span className="inline-flex items-center gap-1.5 font-display font-bold text-[15px] text-primary">
              <Sparkles size={14} />
              {avecJours(r.essai_titre) || t('premium.essai_titre', { count: essaiJours, n: essaiJours })}
            </span>
            <span className="text-[13px] text-dim leading-snug">
              {avecJours(r.essai_texte)}
            </span>
          </div>
        )}

        {/* Choix du type de compte AVANT les prix : les fonctions utiles
            diffèrent, et laisser le visiteur deviner lesquelles le concernent
            est la principale source d'ambiguïté de cette page. */}
        {typesActif && (
          <div className="mt-8">
            <div
              role="tablist"
              aria-label={t('premium.type_aria')}
              className="inline-flex items-center gap-1 bg-subtle border border-edge rounded-xl p-1"
            >
              {['artisan', 'designer'].map((ty) => (
                <button
                  key={ty}
                  role="tab"
                  aria-selected={type === ty}
                  onClick={() => setType(ty)}
                  className={cn(
                    'px-5 py-2 rounded-[10px] text-sm font-semibold transition',
                    type === ty ? 'bg-primary text-inverse' : 'text-ghost hover:text-ink',
                  )}
                >
                  {bi(r[`type_${ty}`]?.libelle) || (ty === 'artisan' ? 'Artisan' : 'Designer')}
                </button>
              ))}
            </div>
            <p className="text-sm text-ghost mt-3 max-w-md mx-auto">{bi(r[`type_${type}`]?.texte)}</p>
          </div>
        )}

        {hasAnnuel && (
          <div className="inline-flex items-center gap-1 mt-6 bg-subtle border border-edge rounded-xl p-1">
            {['mensuel', 'annuel'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                className={cn(
                  'px-4 py-2 rounded-[10px] text-sm font-semibold transition',
                  periode === p ? 'bg-primary text-inverse' : 'text-ghost hover:text-ink',
                )}
              >
                {p === 'mensuel' ? t('premium.mensuel') : t('premium.annuel')}
                {p === 'annuel' && <span className="ml-1.5 text-[10px] font-bold bg-success/15 text-success px-1.5 py-0.5 rounded-full">{t('premium.deux_mois')}</span>}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Grille plans */}
      <section className="max-w-[1100px] mx-auto px-5 pb-16">
        {plans === null ? (
          <p className="text-center text-dim py-10">{t('premium.chargement')}</p>
        ) : tiers.length === 0 ? (
          <p className="text-center text-dim py-10">{t('premium.bientot')}</p>
        ) : (
          /* `items-stretch` + hauteur pleine : les cartes gardent la même
             hauteur quel que soit le nombre de lignes, sinon la grille part en
             escalier dès qu'un plan a une fonction de moins. */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {tiers.map((ti, i) => {
              const plan = ti.variants[periode] ?? ti.variants.gratuit ?? Object.values(ti.variants)[0]
              if (!plan) return null
              const Icon = TIER_ICONS[i] ?? Star
              const prix = Number(plan.prix_xof) || 0
              const isFree = prix === 0
              const populaire = planPopulaire && ti.tier === planPopulaire
              const suffix = (plan.duree_jours >= 300) ? t('premium.par_an') : t('premium.par_mois')
              const features = featuresFromConfig(plan.config, t, type)

              const nom = (enAnglais && ti.labelEn) ? ti.labelEn : ti.label
              const accroche = enAnglais
                ? (plan.description_courte_en || plan.description_courte)
                : plan.description_courte

              return (
                <div
                  key={ti.tier}
                  className={cn(
                    'relative bg-card border rounded-2xl p-7 flex flex-col h-full',
                    populaire ? 'border-primary shadow-lg shadow-primary/10 md:scale-[1.02]' : 'border-edge',
                  )}
                >
                  {/* Un seul badge, celui du plan mis en avant — choisi en
                      admin. Avant, l'accroche de CHAQUE plan s'affichait en
                      pastille : trois badges ne mettent rien en avant. */}
                  {populaire && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap bg-primary text-inverse shadow-sm">
                      <Sparkles size={11} />
                      {bi(r.badge_populaire) || t('premium.populaire')}
                    </span>
                  )}

                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', populaire ? 'bg-primary/10' : 'bg-subtle')}>
                    <Icon size={20} className={populaire ? 'text-primary' : 'text-dim'} />
                  </div>

                  <h3 className="font-display font-bold text-xl text-ink">{nom}</h3>

                  {/* L'accroche tient sur DEUX lignes, centrée et de hauteur
                      fixe : sur une seule ligne elle se chevauchait dès que la
                      fenêtre rétrécissait, et sans hauteur réservée les prix
                      des trois cartes ne s'alignaient plus. */}
                  {accroche && (
                    <p className="text-[13px] text-ghost leading-snug mt-1.5 min-h-[2.6em] line-clamp-2">
                      {accroche}
                    </p>
                  )}

                  <div className="mt-3 mb-1">
                    {/* Le plan gratuit affiche son PRIX — zéro — et non le mot
                        « Gratuit » une seconde fois : il figure déjà comme nom
                        du plan juste au-dessus. */}
                    <span className="font-display font-extrabold text-3xl text-ink">
                      {isFree ? '0' : prix.toLocaleString(enAnglais ? 'en-US' : 'fr-FR')}
                    </span>
                    <span className="text-dim text-sm ml-1">
                      {t('premium.fcfa')}{!isFree && ` ${suffix}`}
                    </span>
                  </div>

                  {/* Le montant mensuel équivalent, sans « soit » ni « i.e. ». */}
                  {!isFree && plan.duree_jours >= 300 && plan.prix_mensuel_equivalent_xof > 0 && (
                    <p className="text-xs text-success font-medium mb-3">
                      {Number(plan.prix_mensuel_equivalent_xof).toLocaleString(enAnglais ? 'en-US' : 'fr-FR')} {t('premium.fcfa')} {t('premium.par_mois')}
                    </p>
                  )}

                  <ul className="mt-4 space-y-2.5 flex-1">
                    {features.map((ff) => (
                      <li key={ff.cle} className="flex items-start gap-2 text-sm text-dim">
                        <Check size={14} className="text-primary shrink-0 mt-0.5" />
                        {ff.texte}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/inscription"
                    className={cn(
                      'mt-6 w-full py-3 rounded-xl font-semibold text-sm text-center transition',
                      populaire
                        ? 'bg-primary text-inverse hover:bg-primary-600'
                        : 'border border-edge text-ink hover:border-primary hover:text-primary',
                    )}
                  >
                    {isFree ? t('premium.commencer_gratuit') : t('premium.choisir', { plan: nom })}
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {/* Note sous la grille — elle vaut pour TOUS les plans, d'où sa place
            sous la grille et non dans une carte. */}
        {r.note_actif !== false && bi(r.note) && (
          <p className="mt-6 text-center text-xs text-ghost max-w-2xl mx-auto leading-relaxed">
            {bi(r.note)}
          </p>
        )}

        {/* Essai gratuit */}
        <div className="mt-6 text-center">
          <p className="text-sm text-ghost">
            {t('premium.essai')}{' '}
            <Link to="/inscription" className="text-primary font-semibold hover:underline">{t('premium.essai_cta')}</Link>
          </p>
        </div>

        {/* Options complémentaires. Tant que les packs ne sont pas finalisés,
            un simple contact suffit : mieux vaut annoncer qu'une extension est
            possible que laisser croire l'offre figée. */}
        {r.packs_actif !== false && bi(r.packs_texte) && (
          <div className="mt-10 bg-subtle border border-edge rounded-2xl p-7 text-center max-w-3xl mx-auto">
            <h3 className="font-display font-bold text-lg text-ink">{bi(r.packs_titre)}</h3>
            <p className="text-sm text-dim mt-2 max-w-xl mx-auto leading-relaxed">{bi(r.packs_texte)}</p>
            <Link
              to={r.packs_lien || '/support'}
              className="inline-flex items-center justify-center mt-5 px-5 py-2.5 rounded-xl border border-edge text-ink font-semibold text-sm hover:border-primary hover:text-primary transition"
            >
              {bi(r.packs_bouton) || t('premium.packs_bouton')}
            </Link>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="max-w-[720px] mx-auto px-5 pb-20">
        <h2 className="font-display font-bold text-2xl text-ink text-center mb-8">{t('premium.faq_titre')}</h2>
        <div className="space-y-4">
          {(Array.isArray(faq) ? faq : []).map(({ q, r: rep }) => (
            <div key={q} className="bg-card border border-edge rounded-xl p-5">
              <p className="font-semibold text-ink mb-1.5">{q}</p>
              <p className="text-sm text-dim leading-relaxed">{rep}</p>
            </div>
          ))}
        </div>
      </section>
    </VitrineShell>
  )
}
