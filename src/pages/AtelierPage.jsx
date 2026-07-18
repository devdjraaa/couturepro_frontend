import { useNavigate } from 'react-router-dom'
import {
  Scissors, Ruler, Building2, Users, MapPin,
  Palette, MessageCircle, Globe, CreditCard,
  Lock, HelpCircle, ChevronRight, Images,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts'
import { useAtelierParametres } from '@/hooks/useParametres'
import { useVetements } from '@/hooks/useVetements'
import { AppLayout } from '@/components/layout'
import { cn } from '@/utils/cn'

// ── Composants internes ────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="px-4">
      <p className="text-xs font-semibold text-ghost uppercase tracking-widest px-0.5 pb-1.5 pt-5">
        {title}
      </p>
      <div className="bg-card border border-edge rounded-2xl overflow-hidden divide-y divide-edge">
        {children}
      </div>
    </div>
  )
}

function SettingsRow({ icon: Icon, label, value, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-subtle transition-colors text-left"
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
        danger ? 'bg-danger/10' : 'bg-primary-50',
      )}>
        <Icon size={15} className={danger ? 'text-danger' : 'text-primary-700'} />
      </div>
      <span className={cn('flex-1 text-sm font-medium', danger ? 'text-danger' : 'text-ink')}>
        {label}
      </span>
      {value !== undefined && (
        <span className="text-xs text-ghost mr-1">{value}</span>
      )}
      {!danger && <ChevronRight size={14} className="text-ghost shrink-0" />}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AtelierPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, atelier, logout } = useAuth()
  const { data: atelierParams }   = useAtelierParametres()
  const { data: vetements = [] }  = useVetements()

  const nom      = atelierParams?.nom   ?? atelier?.nom   ?? t('atelier.titre')
  const ville    = atelierParams?.ville ?? atelier?.ville ?? ''
  const initial  = nom[0]?.toUpperCase() ?? 'A'
  const mesModeles = vetements.filter(v => !v.is_systeme).length

  return (
    <AppLayout title={t('atelier.titre')}>
      <div className="pb-safe">
        {/* Hero atelier */}
        <div className="px-4 py-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-700 flex items-center justify-center text-inverse text-2xl font-bold font-display shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-ink truncate">{nom}</p>
            {ville ? (
              <p className="text-sm text-ghost">{ville}</p>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/parametres?tab=atelier')}
                className="text-xs text-primary underline underline-offset-2"
              >
                {t('atelier.ajouter_ville')}
              </button>
            )}
          </div>
        </div>

        {/* Mon catalogue */}
        <Section title={t('atelier.section_catalogue')}>
          <SettingsRow
            icon={Scissors}
            label={t('atelier.modeles')}
            value={mesModeles > 0 ? String(mesModeles) : undefined}
            onClick={() => navigate('/catalogue/modeles')}
          />
          <SettingsRow
            icon={Ruler}
            label={t('atelier.fiches_mesures')}
            onClick={() => navigate('/clients')}
          />
          <SettingsRow
            icon={Images}
            label={t('realisations.titre')}
            onClick={() => navigate('/realisations')}
          />
        </Section>

        {/* Mon atelier */}
        <Section title={t('parametres.atelier.titre')}>
          <SettingsRow
            icon={Building2}
            label={t('atelier.informations')}
            onClick={() => navigate('/parametres?tab=atelier')}
          />
          <SettingsRow
            icon={Users}
            label={t('atelier.mon_equipe')}
            onClick={() => navigate('/equipe')}
          />
          <SettingsRow
            icon={MapPin}
            label={t('parametres.onglets.ateliers')}
            onClick={() => navigate('/parametres?tab=ateliers')}
          />
        </Section>

        {/* Paramètres */}
        <Section title={t('parametres.titre')}>
          <SettingsRow
            icon={Palette}
            label={t('parametres.liens.theme')}
            onClick={() => navigate('/parametres/theme')}
          />
          <SettingsRow
            icon={MessageCircle}
            label={t('parametres.liens.communications')}
            onClick={() => navigate('/parametres/communications')}
          />
          <SettingsRow
            icon={Globe}
            label={t('langue.titre')}
            value={user?.langue?.toUpperCase() ?? 'FR'}
            onClick={() => navigate('/parametres?tab=preferences')}
          />
          <SettingsRow
            icon={CreditCard}
            label={t('parametres.onglets.abonnement')}
            onClick={() => navigate('/parametres?tab=abonnement')}
          />
          <SettingsRow
            icon={Lock}
            label={t('parametres.onglets.securite')}
            onClick={() => navigate('/parametres?tab=securite')}
          />
          <SettingsRow
            icon={HelpCircle}
            label={t('parametres.liens.support')}
            onClick={() => navigate('/support')}
          />
        </Section>

        {/* Déconnexion */}
        <div className="px-4 pt-6 pb-10 text-center">
          <button
            type="button"
            onClick={() => { if (confirm(t('atelier.confirmer_deconnexion'))) logout() }}
            className="text-sm font-medium text-danger/70 hover:text-danger transition-colors py-2"
          >
            {t('parametres.deconnexion')}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
