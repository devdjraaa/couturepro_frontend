import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Activity, Database, HardDrive, Layers, AlertTriangle, ListChecks } from 'lucide-react'
import { AdminLayout } from '@/components/admin'
import { diagnosticAdminService } from '@/services/admin/diagnosticAdminService'

// P110-111 : outil de diagnostic admin (santé système + dernières erreurs).
function Section({ icon: Icon, titre, children }) {
  return (
    <div className="bg-card border border-edge rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-ink">{titre}</h3>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Row({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-ghost">{label}</span>
      <span className={`font-medium tabular-nums text-right ${ok === true ? 'text-success' : ok === false ? 'text-error' : 'text-ink'}`}>
        {value ?? '—'}
      </span>
    </div>
  )
}

export default function DiagnosticPage() {
  const { t } = useTranslation()
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'diagnostic'],
    queryFn: () => diagnosticAdminService.get(),
    refetchInterval: 30000, // temps réel léger
  })

  const l = (k) => t('admin.diagnostic.f.' + k)
  const app = data?.app ?? {}
  const file = data?.file ?? {}
  const base = data?.base ?? {}
  const sto = data?.stockage ?? {}
  const mod = data?.modules ?? {}
  const erreurs = data?.erreurs ?? []

  return (
    <AdminLayout title={t('admin.diagnostic.titre')}>
      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-xs text-ghost">
            {data?.genere_a ? new Date(data.genere_a).toLocaleString() : (isLoading ? '…' : '')}
          </p>
          <button onClick={() => refetch()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80">
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />{t('admin.diagnostic.rafraichir')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Section icon={Activity} titre={t('admin.diagnostic.app')}>
            <Row label={l('env')} value={app.env} />
            <Row label={l('version')} value={app.version_app} />
            <Row label={l('php')} value={app.php} />
            <Row label={l('laravel')} value={app.laravel} />
            <Row label={l('debug')} value={app.debug ? 'on' : 'off'} ok={app.debug ? false : undefined} />
            <Row label={l('cache_config')} value={app.cache_config ? 'OK' : '—'} />
            <Row label={l('cache_routes')} value={app.cache_routes ? 'OK' : '—'} />
          </Section>

          <Section icon={ListChecks} titre={t('admin.diagnostic.queue')}>
            <Row label={l('connexion')} value={file.connexion} />
            <Row label={l('en_attente')} value={file.en_attente} />
            <Row label={l('echecs')} value={file.echecs} ok={file.echecs === 0 ? true : file.echecs > 0 ? false : undefined} />
            <Row label={l('dernier_echec')} value={file.dernier_echec ? new Date(file.dernier_echec).toLocaleString() : '—'} />
          </Section>

          <Section icon={Database} titre={t('admin.diagnostic.base')}>
            <Row label={l('connexion')} value={base.connexion ? 'OK' : 'KO'} ok={!!base.connexion} />
            <Row label={l('driver')} value={base.driver} />
            <Row label={l('taille')} value={base.taille} />
            <Row label={l('migrations')} value={base.migrations_ran} />
          </Section>

          <Section icon={HardDrive} titre={t('admin.diagnostic.stockage')}>
            <Row label={l('total')} value={sto.total_go != null ? sto.total_go + ' Go' : '—'} />
            <Row label={l('libre')} value={sto.libre_go != null ? sto.libre_go + ' Go' : '—'} />
            <Row label={l('utilise')} value={sto.utilise_pct != null ? sto.utilise_pct + ' %' : '—'} ok={sto.utilise_pct != null ? sto.utilise_pct < 85 : undefined} />
          </Section>

          <Section icon={Layers} titre={t('admin.diagnostic.modules')}>
            <Row label={l('ateliers_total')} value={mod.ateliers_total} />
            <Row label={l('ateliers_actifs')} value={mod.ateliers_actifs} />
            <Row label={l('ateliers_geles')} value={mod.ateliers_geles} />
            <Row label={l('abonnements_actifs')} value={mod.abonnements_actifs} />
          </Section>
        </div>

        <Section icon={AlertTriangle} titre={t('admin.diagnostic.erreurs')}>
          {erreurs.length === 0 ? (
            <p className="text-sm text-ghost">{t('admin.diagnostic.aucune_erreur')}</p>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {erreurs.map((e, i) => (
                <p key={i} className="text-[11px] font-mono text-error/90 break-words border-b border-edge/40 pb-1">{e}</p>
              ))}
            </div>
          )}
        </Section>
      </div>
    </AdminLayout>
  )
}
