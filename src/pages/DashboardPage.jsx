import { useState, useRef, useEffect } from 'react'
import BandeAnnonces from '@/components/layout/BandeAnnonces'
import { useNavigate } from 'react-router-dom'
import { Plus, UserPlus, Wallet, ClipboardList, ChevronRight, ChevronDown, CheckCircle2, CircleUser, Sun, Moon, Store, X, Layers, Users2, Star, FileText, Crown, Hand, Bell, ShoppingBag, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { isToday, isPast, parseISO, differenceInCalendarDays, isThisMonth, subDays } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout'
import { Skeleton, EmptyState, Button, CountdownBadge, MoneyAmount, QuickActionTile, LanguageSwitcher } from '@/components/ui'
import Avatar from '@/components/ui/Avatar'
import { formatDate } from '@/utils/formatDate'
import { useNotificationsCount } from '@/hooks/useNotifications'
import { useAuth, useTheme } from '@/contexts'
import { useCommandes, useCommandeStats } from '@/hooks/useCommandes'
import { useClients } from '@/hooks/useClients'
import { useAbonnement } from '@/hooks/useAbonnement'
import { useAccountType } from '@/hooks/useAccountType'
import MultiAteliersStats from '@/components/dashboard/MultiAteliersStats'
import { ROUTES } from '@/constants/routes'
import { useFormatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

// ── Salutation ───────────────────────────────────────────────────────────────
function Greeting({ user, subtitle, hero = false }) {
  const { t, i18n } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('dashboard.bonjour') : hour < 18 ? t('dashboard.bon_aprem') : t('dashboard.bonsoir')
  const dateStr  = new Date().toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const initials = [user?.prenom?.[0], user?.nom?.split(' ')[0]?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?'

  return (
    <div className={hero ? 'pt-2 pb-1' : 'pt-4 pb-2'}>
      {/* La marque n'apparaissait NULLE PART sur l'écran d'accueil : on ouvrait
          l'application sans jamais voir le logo. Il est posé en tête de l'en-tête,
          en blanc — le signe officiel est rouge, donc invisible sur ce fond.
          (Version blanche fournie par la direction, reprise du dépôt backend.) */}
      {hero && (
        <div className="flex items-center gap-2 mb-3">
          <img
            src="/logo-gextimo-blanc.png" alt="" aria-hidden="true"
            className="w-7 h-7 shrink-0 object-contain"
          />
          <span className="text-inverse font-bold text-[17px] lowercase tracking-tight">gextimo</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className={cn('mb-1', hero ? 'text-[11px] font-bold uppercase tracking-[.18em]' : 'text-xs capitalize text-ghost')}
            /* Sur le rouge de l'en-tête il faut un ton CLAIR : cette ligne
               utilisait l'ancien doré, devenu sombre — elle aurait disparu. */
            style={hero ? { color: 'rgba(255,255,255,.72)' } : undefined}
          >
            {dateStr}
          </p>
          <h1 className={cn('font-bold font-display', hero ? 'text-[34px] leading-[1.08] text-inverse' : 'text-xl leading-tight text-ink')}>
            {greeting}, {user?.prenom ?? user?.nom?.split(' ')[0] ?? ''}
            <Hand size={hero ? 28 : 18} className="inline-block ml-2 align-[-0.15em] text-accent" aria-hidden="true" />
          </h1>
        </div>
        {hero && (
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-inverse/10 hover:bg-inverse/20 transition-colors shrink-0"
              aria-label={isDark ? t('commun.passer_mode_clair') : t('commun.passer_mode_sombre')}
            >
              {isDark ? <Sun size={17} className="text-inverse" /> : <Moon size={17} className="text-inverse" />}
            </button>
            <LanguageSwitcher variant="hero" />
            <button
              type="button"
              onClick={() => navigate('/parametres/profil')}
              className="w-11 h-11 flex items-center justify-center rounded-2xl text-[13px] font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-gold-hi) 0%, var(--color-gold-dark) 100%)', color: 'var(--color-avatar-on-gold)' }}
              aria-label={t('nav.profil')}
            >
              {initials}
            </button>
          </div>
        )}
      </div>
      {subtitle && (
        <p className={cn('text-sm mt-1.5', hero ? 'text-inverse/85' : 'text-ghost')}>{subtitle}</p>
      )}
    </div>
  )
}


/* ══ Blocs de l'accueil, d'après la maquette fournie par la direction ══════════
   L'accueil ouvrait sur un grand aplat rouge sans logo. La maquette pose un
   en-tête BLANC portant la marque, puis une suite de cartes : salutation,
   vue d'ensemble rouge, solde, commandes récentes. On s'y tient. */

/** En-tête blanc : la marque à gauche, les notifications à droite. */
function EnteteMarque({ navigate, nbNotifs }) {
  const { t } = useTranslation()

  return (
    <div className="bg-card px-4 pt-safe pb-3 flex items-center justify-between gap-3 border-b border-edge">
      <img
        src="/logo-gextimo-complet.png"
        alt="Gextimo"
        className="h-8 object-contain object-left dark:hidden"
      />
      {/* En thème sombre le logotype noir disparaîtrait : version claire. */}
      <img
        src="/logo-gextimo-complet-blanc.png"
        alt="Gextimo"
        className="h-8 object-contain object-left hidden dark:block"
      />

      <button
        type="button"
        onClick={() => navigate('/notifications')}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-subtle transition-colors shrink-0"
        aria-label={t('nav.notifications')}
      >
        <Bell size={20} className="text-ink" />
        {nbNotifs > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-inverse text-[10px] font-bold flex items-center justify-center">
            {nbNotifs > 9 ? '9+' : nbNotifs}
          </span>
        )}
      </button>
    </div>
  )
}

/** Carte de salutation : qui je suis, ce qui m'attend. */
function CarteSalutation({ user, sousTitre, navigate }) {
  const { t } = useTranslation()
  const heure = new Date().getHours()
  const salut = heure < 12 ? t('dashboard.bonjour') : heure < 18 ? t('dashboard.bon_aprem') : t('dashboard.bonsoir')
  const prenom = user?.prenom ?? user?.nom?.split(' ')[0] ?? ''

  return (
    <div className="bg-card border border-edge rounded-2xl p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[19px] font-bold text-ink leading-tight">
          {salut}, {prenom} !{' '}
          {/* Seul emoji autorisé ici avec celui des confettis (accord direction) :
              la main de salutation, comme sur la maquette. Partout ailleurs on
              reste sur les icônes lucide. */}
          <span role="img" aria-label="salutation">👋</span>
        </h1>
        <p className="text-[13px] text-dim mt-0.5">
          {sousTitre ?? t('dashboard.resume_du_jour')}
        </p>
      </div>
      <button type="button" onClick={() => navigate('/parametres/profil')}
              className="shrink-0" aria-label={t('nav.profil')}>
        <Avatar nom={user?.nom} photo_url={user?.avatar} size="lg" />
      </button>
    </div>
  )
}

/** Vue d'ensemble : les quatre chiffres du jour, sur l'aplat rouge de la marque. */
function VueEnsemble({ nbCommandes, nbClients, nbLivraisons, nbPaiements, navigate }) {
  const { t } = useTranslation()

  const cases = [
    { icone: ShoppingBag, valeur: nbCommandes, libelle: t('nav.commandes'), to: '/commandes' },
    { icone: Users2,      valeur: nbClients,   libelle: t('nav.clients'),   to: '/clients' },
    { icone: Truck,       valeur: nbLivraisons, libelle: t('dashboard.vue_livraisons'), to: '/commandes' },
    { icone: Wallet,      valeur: nbPaiements, libelle: t('dashboard.vue_paiements'),  to: '/caisse' },
  ]

  return (
    <div className="rounded-2xl p-4 text-inverse" style={{ background: 'linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-primary) 100%)' }}>
      <p className="text-[15px] font-bold mb-3">{t('dashboard.vue_titre')}</p>
      <div className="grid grid-cols-4 gap-1">
        {cases.map(({ icone: Icone, valeur, libelle, to }, i) => (
          <button key={libelle} type="button" onClick={() => navigate(to)}
                  className={'flex flex-col items-center gap-1 py-1 ' + (i > 0 ? 'border-l border-inverse/20' : '')}>
            <Icone size={18} className="text-inverse/80" aria-hidden="true" />
            <span className="text-[21px] font-bold leading-none tabular-nums">{valeur}</span>
            <span className="text-[11px] text-inverse/75 leading-tight text-center">{libelle}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/** Solde du jour — le montant se lit d'un coup d'œil, en noir. */
function SoldeDuJour({ montant, fmt, navigate }) {
  const { t } = useTranslation()

  return (
    <button type="button" onClick={() => navigate('/caisse')}
            className="w-full bg-card border border-edge rounded-2xl p-4 flex items-center justify-between gap-3 text-left">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink">{t('dashboard.solde_titre')}</p>
        <p className="text-[26px] font-bold text-ink leading-tight mt-0.5 tabular-nums">{fmt(montant)}</p>
        <p className="text-[12px] text-ghost mt-0.5">{t('dashboard.solde_disponible')}</p>
      </div>
      <span className="shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Wallet size={24} className="text-primary" aria-hidden="true" />
      </span>
    </button>
  )
}

/** Trois dernières commandes, avec leur état et leur montant. */
function CommandesRecentes({ commandes, fmt, navigate }) {
  const { t } = useTranslation()
  const recentes = [...commandes]
    .sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0))
    .slice(0, 3)

  if (recentes.length === 0) return null

  const TON = {
    livre:    'bg-success/10 text-success',
    en_cours: 'bg-warning/10 text-warning',
    essai:    'bg-info/10 text-info',
    annule:   'bg-subtle text-ghost',
  }

  return (
    <div className="bg-card border border-edge rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[15px] font-bold text-ink">{t('dashboard.recentes')}</p>
        <button type="button" onClick={() => navigate('/commandes')} className="text-[13px] font-semibold text-primary">
          {t('commun.voir_tout')}
        </button>
      </div>

      <div className="divide-y divide-edge">
        {recentes.map((c) => (
          <button key={c.id} type="button" onClick={() => navigate(`/commandes/${c.id}`)}
                  className="w-full flex items-center gap-3 py-2.5 text-left first:pt-0 last:pb-0">
            <span className="shrink-0 w-11 h-11 rounded-xl bg-subtle flex items-center justify-center overflow-hidden">
              {c.image_url
                ? <img src={c.image_url} alt="" className="w-full h-full object-cover" />
                : <ClipboardList size={18} className="text-ghost" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-ink truncate">
                {c.reference ?? c.vetement_nom ?? t('nav.commandes')}
              </p>
              <p className="text-[11.5px] text-ghost">{formatDate(c.created_at)}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className={'text-[10.5px] font-bold px-2 py-0.5 rounded-full ' + (TON[c.statut] ?? TON.annule)}>
                {t(`commandes.statut.${c.statut}`, c.statut)}
              </span>
              <p className="text-[13.5px] font-bold text-ink mt-1 tabular-nums">{fmt(c.prix ?? 0)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Caisse du jour ────────────────────────────────────────────────────────────
function CaisseCard({ stats, isLoading, navigate }) {
  const { t } = useTranslation()
  const encaisse = stats?.total_encaisse ?? 0

  return (
    <div
      className="rounded-2xl p-4 text-inverse"
      style={{ background: 'linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-primary-600) 55%, var(--color-primary) 100%)' }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-inverse/60">{t('dashboard.caisse.titre')}</p>
        <button
          type="button"
          onClick={() => navigate('/caisse')}
          className="flex items-center gap-1 text-xs text-inverse/70 hover:text-inverse transition-colors"
        >
          {t('dashboard.caisse.voir_detail')} <ChevronRight size={12} />
        </button>
      </div>

      {isLoading ? (
        <div className="h-9 w-40 rounded-lg bg-inverse/10 animate-pulse mt-2" />
      ) : encaisse === 0 ? (
        <div className="mt-2">
          <p className="text-sm text-inverse/60">{t('dashboard.caisse.vide')}</p>
          <button
            type="button"
            onClick={() => navigate('/caisse')}
            className="mt-2 text-xs font-medium text-inverse/90 underline underline-offset-2"
          >
            {t('dashboard.caisse.enregistrer')}
          </button>
        </div>
      ) : (
        <div className="mt-2 relative">
          <MoneyAmount value={encaisse} size="lg" className="text-inverse" />
          <p className="text-xs text-inverse/50 mt-1">{t('dashboard.caisse.encaisse_auj')}</p>
          <svg viewBox="0 0 80 28" className="absolute right-0 top-0 w-20 h-7 opacity-25 pointer-events-none" fill="none" aria-hidden="true">
            <polyline points="0,24 12,18 24,20 36,10 48,14 60,5 72,8 80,4" stroke="white" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  )
}

// ── Élément "À faire" ─────────────────────────────────────────────────────────
const TYPE_CFG = {
  retard:    { bg: 'bg-danger/10',   text: 'text-danger',     abbr: 'RETARD' },
  livraison: { bg: 'bg-primary/10',  text: 'text-primary',    abbr: 'LIVR.' },
  essai:     { bg: 'bg-accent-50',   text: 'text-accent-600', abbr: 'ESSAI' },
  solde:     { bg: 'bg-gold-light',  text: 'text-gold-dark',  abbr: 'SOLDE' },
}

function TodoItem({ label, client, dueDate, type, to, navigate, timeStr }) {
  const cfg = TYPE_CFG[type] ?? TYPE_CFG.livraison
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="flex items-center gap-3 w-full py-2.5 border-b border-edge last:border-0 hover:bg-subtle -mx-1 px-1 rounded-lg transition-colors text-left"
    >
      <div className={cn('w-14 shrink-0 flex flex-col items-center justify-center py-2 rounded-xl', cfg.bg)}>
        <span className={cn('text-[13px] font-mono font-bold leading-tight', cfg.text)}>{timeStr}</span>
        <span className={cn('text-[9px] font-bold uppercase tracking-wide mt-0.5 opacity-70', cfg.text)}>{cfg.abbr}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink truncate">{label}</p>
        <p className="text-xs text-ghost truncate">{client}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {dueDate && <CountdownBadge dueDate={dueDate} />}
        <ChevronRight size={13} className="text-ghost" />
      </div>
    </button>
  )
}

function TodoList({ commandes, isLoading, navigate }) {
  const fmt = useFormatCurrency()
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const items = []
  commandes.forEach(cmd => {
    if (!cmd || cmd.statut === 'livre' || cmd.statut === 'annule') return
    const dateLiv = cmd.date_livraison_prevue ? parseISO(cmd.date_livraison_prevue) : null
    const dateEss = cmd.date_essayage         ? parseISO(cmd.date_essayage)         : null
    const restant = (cmd.prix ?? 0) - (cmd.acompte ?? 0)
    const to = `/commandes/${cmd.id}`
    const vetement = cmd.vetement_nom ?? t('catalogue.titre')

    if (dateLiv && (isPast(dateLiv) || isToday(dateLiv))) {
      const isRetard = isPast(dateLiv) && !isToday(dateLiv)
      const type = isRetard ? 'retard' : 'livraison'
      const timeStr = isRetard ? `-${Math.abs(differenceInCalendarDays(dateLiv, today))}j` : 'Auj.'
      items.push({ type, timeStr, label: t('dashboard.todo.livraison', { vetement }), client: cmd.client_nom, dueDate: cmd.date_livraison_prevue, to, priority: isRetard ? 0 : 1 })
    } else if (dateEss && isToday(dateEss)) {
      items.push({ type: 'essai', timeStr: 'Auj.', label: t('dashboard.todo.essayage', { vetement }), client: cmd.client_nom, dueDate: cmd.date_essayage, to, priority: 1 })
    } else if (restant > 0 && dateLiv && differenceInCalendarDays(dateLiv, today) <= 3) {
      const dLeft = differenceInCalendarDays(dateLiv, today)
      items.push({ type: 'solde', timeStr: dLeft === 0 ? 'Auj.' : `J-${dLeft}`, label: t('dashboard.todo.solde', { montant: fmt(restant) }), client: cmd.client_nom, dueDate: cmd.date_livraison_prevue, to, priority: 2 })
    }
  })

  items.sort((a, b) => a.priority - b.priority)

  if (items.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title={t('dashboard.todo.libre')}
        description={t('dashboard.todo.libre_desc')}
        primaryAction={
          <Button size="sm" variant="secondary" onClick={() => navigate('/commandes')}>
            {t('dashboard.todo.voir_commandes')}
          </Button>
        }
        className="py-6"
      />
    )
  }

  return (
    <div className="-mt-1">
      {items.slice(0, 6).map((item, i) => (
        <TodoItem key={i} {...item} navigate={navigate} />
      ))}
    </div>
  )
}

// ── Onboarding checklist ─────────────────────────────────────────────────────
const ONBOARDING_DISMISS_KEY = 'gx_onboarding_done'

function WelcomeChecklist({ user, atelier, clients, commandes, isLoading, navigate }) {
  const { t } = useTranslation()
  const { isDesigner } = useAccountType()
  const [dismissed, setDismissed] = useState(() => {
    try { return !!localStorage.getItem(ONBOARDING_DISMISS_KEY) } catch { return false }
  })

  const dismiss = () => {
    try { localStorage.setItem(ONBOARDING_DISMISS_KEY, '1') } catch { /* indisponible */ }
    setDismissed(true)
  }

  if (isLoading || dismissed) return null

  const steps = [
    {
      icon: CircleUser,
      label: t('dashboard.onboarding.step_profil'),
      sub: t('dashboard.onboarding.step_profil_sub'),
      done: !!user?.telephone,
      to: '/parametres/profil',
    },
    ...(isDesigner ? [{
      icon: Store,
      label: 'Configurer ma vitrine',
      sub: 'Ajoutez votre bio et spécialité pour attirer des clients',
      done: !!(atelier?.bio),
      to: '/ma-vitrine',
    }] : []),
    {
      icon: UserPlus,
      label: t('dashboard.onboarding.step_client'),
      sub: t('dashboard.onboarding.step_client_sub'),
      done: clients.length > 0,
      to: '/clients',
    },
    {
      icon: ClipboardList,
      label: t('dashboard.onboarding.step_commande'),
      sub: t('dashboard.onboarding.step_commande_sub'),
      done: commandes.length > 0,
      to: '/commandes/new',
    },
  ]

  const doneCount = steps.filter(s => s.done).length
  if (doneCount === steps.length) return null

  return (
    <div className="bg-card border border-edge rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-primary/8 to-accent/5 px-4 pt-4 pb-3 border-b border-edge">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-ink">{t('dashboard.onboarding.titre')}</p>
            <p className="text-xs text-ghost mt-0.5">{t('dashboard.onboarding.etapes', { fait: doneCount, total: steps.length })}</p>
          </div>
          <button onClick={dismiss} aria-label="Masquer" className="w-7 h-7 flex items-center justify-center rounded-full text-ghost hover:text-ink transition shrink-0">
            <X size={14} />
          </button>
        </div>
        <div className="mt-2.5 h-1 bg-edge rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="divide-y divide-edge">
        {steps.map((step, i) => (
          <button
            key={i}
            type="button"
            onClick={() => !step.done && navigate(step.to)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
              !step.done && 'hover:bg-subtle active:bg-subtle/70',
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
              step.done ? 'bg-success/10' : 'bg-primary/8',
            )}>
              {step.done
                ? <CheckCircle2 size={16} className="text-success" />
                : <step.icon size={15} className="text-primary" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium leading-tight',
                step.done ? 'line-through text-ghost' : 'text-ink',
              )}>
                {step.label}
              </p>
              <p className="text-xs text-ghost mt-0.5">{step.sub}</p>
            </div>
            {!step.done && <ChevronRight size={14} className="text-ghost shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── KPIs horizontaux ──────────────────────────────────────────────────────────
function KpiChip({ label, value, color = 'default', trend }) {
  const textColors = {
    default: 'text-ink',
    gold:    'text-gold-dark',
    success: 'text-success',
    primary: 'text-primary',
    danger:  'text-danger',
  }
  return (
    <div className="shrink-0 flex flex-col items-center px-5 py-3.5">
      <div className="flex items-baseline gap-0.5">
        <span className={cn('font-mono font-bold text-[22px] tabular-nums leading-none', textColors[color])}>
          {value ?? '—'}
        </span>
        {trend != null && trend !== 0 && (
          <span className={cn('text-xs font-bold leading-tight', trend > 0 ? 'text-success' : 'text-danger')}>
            {trend > 0 ? '+' : ''}{trend}
          </span>
        )}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[.14em] mt-1 whitespace-nowrap text-ghost text-center leading-tight">{label}</span>
    </div>
  )
}

// ── Abonnement (accès rapide au plan depuis l'accueil) ─────────────────────────
function AbonnementCard({ navigate }) {
  const { t } = useTranslation()
  const { data: abo, isLoading } = useAbonnement()
  if (isLoading || !abo) return null

  const jours  = typeof abo.jours_restants === 'number' ? abo.jours_restants : null
  const essai  = abo.statut === 'essai'
  const urgent = jours !== null && jours <= 3
  const statutLabel = abo.statut ? t(`abonnement.statut.${abo.statut}`, { defaultValue: abo.statut }) : null

  return (
    <button
      onClick={() => navigate(ROUTES.ABONNEMENT)}
      className={cn(
        'w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors',
        urgent ? 'border-danger/30 bg-danger/[0.06] hover:bg-danger/10'
               : essai ? 'border-accent/25 bg-accent/[0.06] hover:bg-accent/10'
                       : 'border-edge bg-card hover:bg-subtle',
      )}
    >
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
        urgent ? 'bg-danger/12 text-danger' : essai ? 'bg-accent/12 text-accent-600' : 'bg-primary/10 text-primary',
      )}>
        <Crown size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-ink truncate">{abo.niveau_label}</span>
          {statutLabel && (
            <span className={cn(
              'text-2xs font-medium px-1.5 py-0.5 rounded-full shrink-0',
              urgent ? 'bg-danger/15 text-danger' : essai ? 'bg-accent/15 text-accent-700' : 'bg-success/15 text-success',
            )}>
              {statutLabel}
            </span>
          )}
        </div>
        {jours !== null && (
          <p className={cn('text-xs mt-0.5', urgent ? 'text-danger font-medium' : 'text-ghost')}>
            {t('dashboard.abonnement.jours_restants', { count: jours })}
          </p>
        )}
      </div>
      <span className="text-xs font-medium text-primary shrink-0">{t('dashboard.abonnement.gerer')}</span>
      <ChevronRight size={15} className="text-ghost shrink-0 -ml-1" />
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const fmt = useFormatCurrency()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { user, atelier }  = useAuth()
  const { isDesigner } = useAccountType()
  const { data: commandes = [], isLoading: loadingCmd } = useCommandes()
  const { data: stats,          isLoading: loadingStats } = useCommandeStats()

  // Indice de défilement des KPI : il disparaît une fois le bout atteint.
  const kpiRef = useRef(null)
  const [kpiAuBout, setKpiAuBout] = useState(false)

  const majFinKpi = () => {
    const el = kpiRef.current
    if (!el) return
    // Marge de 4 px : les navigateurs arrondissent, et sans elle l'indice
    // resterait affiché alors qu'on est visuellement au bout.
    setKpiAuBout(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }

  useEffect(() => {
    // Sur un grand écran tout tient : aucun indice à montrer.
    const el = kpiRef.current
    if (el && el.scrollWidth <= el.clientWidth) setKpiAuBout(true)
  }, [loadingStats])
  const { data: clients = [] }  = useClients()
  const { data: nbNotifs = 0 }  = useNotificationsCount()

  // « Paiements » de la vue d'ensemble = commandes encore à encaisser.
  const nbPaiementsEnAttente = commandes.filter(
    (c) => c.statut !== 'annule' && (Number(c.prix ?? 0) - Number(c.acompte ?? 0)) > 0,
  ).length

  const activeCount   = commandes.filter(c => c.statut === 'en_cours' || c.statut === 'essai').length
  const livreCeMois   = commandes.filter(c => c.statut === 'livre' && c.date_livraison_prevue && isThisMonth(parseISO(c.date_livraison_prevue))).length
  const totalRestant  = stats?.total_restant ?? 0
  const lateCount     = stats?.en_retard ?? 0

  const now = new Date()
  const date30j = subDays(now, 30)
  const date60j = subDays(now, 60)
  const nouveauxClients     = clients.filter(c => c.created_at && parseISO(c.created_at) >= date30j).length
  const nouveauxClientsPrev = clients.filter(c => { if (!c.created_at) return false; const d = parseISO(c.created_at); return d >= date60j && d < date30j }).length
  const tendanceClients     = nouveauxClients - nouveauxClientsPrev
  const urgentToday   = commandes.filter(c => {
    if (c.statut === 'livre' || c.statut === 'annule') return false
    const dateLiv = c.date_livraison_prevue ? parseISO(c.date_livraison_prevue) : null
    const dateEss = c.date_essayage ? parseISO(c.date_essayage) : null
    return (dateLiv && (isPast(dateLiv) || isToday(dateLiv))) || (dateEss && isToday(dateEss))
  }).length

  const dynamicSub = urgentToday > 0
    ? t('dashboard.subtitle.urgentes', { count: urgentToday })
    : activeCount > 0 ? t('dashboard.subtitle.en_cours', { count: activeCount }) : null

  const [actionsExpanded, setActionsExpanded] = useState(false)

  return (
    <AppLayout title={t('dashboard.titre_auj')} noMobileHeader onRefresh={() => queryClient.invalidateQueries()}>

      {/* En-tête BLANC portant la marque (maquette direction). L'accueil
          ouvrait sur un aplat rouge où le logo n'apparaissait nulle part. */}
      <div className="bg-card lg:hidden sticky top-0 z-20">
        <EnteteMarque navigate={navigate} nbNotifs={nbNotifs} />
      </div>

      {/* ANN-8 — bande d'annonces, entre l'en-tête et les indicateurs. Elle
          vivait dans AppLayout, tout en haut : sur cet écran l'en-tête mobile
          est masqué (noMobileHeader), donc elle passait sous la barre système.
          Ici elle est protégée par le hero, et c'est la place demandée. */}
      <BandeAnnonces />

      <div className="p-4 space-y-4 pb-safe">

        {/* Salutation desktop uniquement */}
        <div className="hidden lg:block">
          <Greeting user={user} subtitle={dynamicSub} />
        </div>

        {/* ── Suite de la maquette : salutation, vue d'ensemble, solde,
               commandes récentes. Les blocs existants suivent en dessous. ── */}
        <div className="lg:hidden">
          <CarteSalutation user={user} sousTitre={dynamicSub} navigate={navigate} />
        </div>

        <VueEnsemble
          nbCommandes={activeCount}
          nbClients={clients.length}
          nbLivraisons={livreCeMois}
          nbPaiements={nbPaiementsEnAttente}
          navigate={navigate}
        />

        <SoldeDuJour montant={stats?.total_encaisse ?? 0} fmt={fmt} navigate={navigate} />

        <CommandesRecentes commandes={commandes} fmt={fmt} navigate={navigate} />

        {/* Onboarding checklist — visible uniquement si aucune commande */}
        <WelcomeChecklist
          user={user}
          atelier={atelier}
          clients={clients}
          commandes={commandes}
          isLoading={loadingCmd}
          navigate={navigate}
        />

        {/* Abonnement — accès rapide au plan (plan + temps restant) */}
        <AbonnementCard navigate={navigate} />

        {/* Caisse du jour */}
        <CaisseCard stats={stats} isLoading={loadingStats} navigate={navigate} />

        {/* P100-101 : vue consolidée multi-ateliers (proprios ≥ 2 ateliers, online) */}
        <MultiAteliersStats />

        {/* À faire aujourd'hui */}
        <div className="bg-card border border-edge rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.18em] text-ghost">
              <span className="text-primary font-light">—</span>
              {t('dashboard.a_faire')}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/commandes')}
              className="flex items-center gap-0.5 text-xs font-semibold text-primary"
            >
              {t('dashboard.tout_voir')} <ChevronRight size={12} />
            </button>
          </div>
          <TodoList commandes={commandes} isLoading={loadingCmd} navigate={navigate} />
        </div>

        {/* KPIs secondaires — cinq vignettes dont deux visibles à la fois.
            Rien ne disait qu'on pouvait faire défiler : un dégradé de bord et
            un chevron le montrent, et ils s'effacent dès qu'on a défilé, pour
            ne pas rester à encombrer une fois le geste compris. */}
        <div className="relative">
          <div ref={kpiRef} onScroll={majFinKpi}
               className="bg-card border border-edge rounded-2xl overflow-x-auto scrollbar-none">
          <div className="flex divide-x divide-edge">
            {loadingStats ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="shrink-0 w-24 h-[72px] rounded-xl m-3" />)
            ) : (
              <>
                <KpiChip label={t('dashboard.kpi.en_attente')}        value={fmt(totalRestant)} color="gold" />
                <KpiChip label={t('dashboard.kpi.commandes_actives')} value={activeCount}                  color="primary" />
                <KpiChip label={t('dashboard.kpi.nvx_clients')}       value={nouveauxClients}              color={nouveauxClients > 0 ? 'success' : 'default'} trend={tendanceClients !== 0 ? tendanceClients : null} />
                <KpiChip label={t('dashboard.kpi.livrees_mois')}      value={livreCeMois}                  color="success" />
                <KpiChip label={t('dashboard.kpi.en_retard')}         value={lateCount}                    color={lateCount > 0 ? 'danger' : 'default'} />
              </>
            )}
          </div>
          </div>

          {!kpiAuBout && (
            <div aria-hidden="true"
                 className="pointer-events-none absolute inset-y-0 right-0 w-16 rounded-r-2xl flex items-center justify-end pr-2
                            bg-gradient-to-l from-card via-card/80 to-transparent">
              <ChevronRight size={18} className="text-ghost gx-indice-defilement" />
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.18em] text-ghost mb-3">
            <span className="text-primary font-light">—</span>
            {t('dashboard.actions_rapides')}
          </h2>

          {/* 3 premières — toujours visibles */}
          <div className="grid grid-cols-3 gap-3">
            <QuickActionTile icon={Plus}     label={t('dashboard.action.nouvelle_commande')} color="primary"  onClick={() => navigate('/commandes/new')} />
            <QuickActionTile icon={UserPlus} label={t('dashboard.action.nouveau_client')}    color="success"  onClick={() => navigate('/clients?nouveau=1')} />
            <QuickActionTile icon={Wallet}   label={t('dashboard.action.paiement')}          color="gold"     onClick={() => navigate('/caisse')} />
          </div>

          {/* Options supplémentaires — déroulables */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: actionsExpanded ? '400px' : '0px' }}
          >
            <div className="grid grid-cols-3 gap-3 pt-3">
              <QuickActionTile icon={Layers}   label={t('dashboard.action.atelier')}  color="ghost"   onClick={() => navigate('/catalogue')} />
              {isDesigner && (
                <QuickActionTile icon={Store}    label={t('nav.ma_vitrine')}            color="warning" onClick={() => navigate('/ma-vitrine')} />
              )}
              <QuickActionTile icon={FileText} label={t('nav.facturation')}           color="primary" onClick={() => navigate('/facturation')} />
              <QuickActionTile icon={Users2}   label={t('nav.equipe')}               color="success" onClick={() => navigate('/equipe')} />
              <QuickActionTile icon={Star}     label={t('nav.points')}               color="gold"    onClick={() => navigate('/points')} />
            </div>
          </div>

          {/* Bouton dérouler / réduire */}
          <button
            type="button"
            onClick={() => setActionsExpanded(x => !x)}
            className="mt-3 w-full flex items-center justify-center py-2 rounded-xl border border-edge hover:border-primary/40 hover:bg-subtle transition-all duration-200 group"
            aria-label={actionsExpanded ? 'Réduire' : 'Voir plus'}
          >
            <ChevronDown
              size={16}
              className={cn(
                'text-ghost group-hover:text-primary transition-all duration-300',
                actionsExpanded && 'rotate-180',
              )}
            />
          </button>
        </div>

        {/* Commandes récentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.18em] text-ghost">
              <span className="text-primary font-light">—</span>
              {t('dashboard.recentes')}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/commandes')}
              className="flex items-center gap-0.5 text-xs font-medium text-primary"
            >
              {t('dashboard.tout_voir')} <ChevronRight size={14} />
            </button>
          </div>
          {loadingCmd ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : commandes.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={t('dashboard.recentes_vide.titre')}
              description={t('dashboard.recentes_vide.description')}
              primaryAction={
                <Button onClick={() => navigate('/commandes/new')}>
                  {t('dashboard.recentes_vide.action')}
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {commandes.slice(0, 4).map(cmd => {
                const restant = (cmd.prix ?? 0) - (cmd.acompte ?? 0)
                const isLate  = cmd.statut === 'en_cours' && cmd.date_livraison_prevue && isPast(parseISO(cmd.date_livraison_prevue))
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => navigate(`/commandes/${cmd.id}`)}
                    className="w-full bg-card border border-edge rounded-2xl p-4 text-left hover:border-primary/30 active:opacity-70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{cmd.client_nom}</p>
                        <p className="text-xs text-ghost truncate">{cmd.vetement_nom}</p>
                      </div>
                      {cmd.date_livraison_prevue && (
                        <CountdownBadge dueDate={cmd.date_livraison_prevue} />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={cn('text-xs', isLate ? 'text-danger font-medium' : 'text-ghost')}>
                        {cmd.date_livraison_prevue
                          ? new Date(cmd.date_livraison_prevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                          : '—'}
                      </span>
                      <div className="text-right font-mono text-xs">
                        <span className="font-semibold text-ink">{fmt(cmd.prix ?? 0)}</span>
                        {restant > 0 && <span className="ml-1 text-gold-dark">−{fmt(restant)}</span>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
