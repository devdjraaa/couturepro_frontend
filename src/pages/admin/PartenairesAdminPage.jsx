import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X, Mail, Phone } from 'lucide-react'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useCandidaturesPartenaires, useStatutCandidature, useAdminPartenaires } from '@/hooks/admin/usePartenaires'
import { formatDate } from '@/utils/formatDate'

/**
 * Candidatures « Devenir partenaire » et liste des partenaires.
 *
 * Le formulaire public enregistrait les candidatures et envoyait un e-mail
 * d'alerte — mais AUCUN écran ne lisait la table. Si l'e-mail se perdait (boîte
 * pleine, indésirables, adresse changée), la candidature dormait sans que
 * personne le sache. La table est la seule trace durable : elle devait être
 * consultable, et le statut modifiable.
 */

function OngletCandidatures() {
  const { t } = useTranslation()
  const [statut, setStatut] = useState('en_attente')
  // Sans filtre le serveur renvoie tout : « toutes » passe donc un objet vide.
  const { data, isLoading } = useCandidaturesPartenaires(statut === 'toutes' ? {} : { statut })
  const changer = useStatutCandidature()

  const rows = Array.isArray(data) ? data : (data?.data ?? [])

  const colonnes = [
    { key: 'nom_organisation', label: t('admin.partenaires.organisation'), render: (r) => (
        <div>
          <p className="font-medium text-ink">{r.nom_organisation}</p>
          {r.pays_region && <p className="text-xs text-ghost">{r.pays_region}</p>}
        </div>
      ) },
    { key: 'contact', label: t('admin.partenaires.contact'), render: (r) => (
        <div className="text-xs space-y-0.5">
          {r.contact_nom && <p className="text-ink">{r.contact_nom}</p>}
          {r.contact_email && (
            <a href={`mailto:${r.contact_email}`} className="text-primary inline-flex items-center gap-1">
              <Mail size={11} />{r.contact_email}
            </a>
          )}
          {r.contact_telephone && (
            <a href={`tel:${r.contact_telephone}`} className="text-dim inline-flex items-center gap-1">
              <Phone size={11} />{r.contact_telephone}
            </a>
          )}
        </div>
      ) },
    { key: 'categorie_souhaitee', label: t('admin.partenaires.categorie'), render: (r) => r.categorie_souhaitee || '—' },
    { key: 'type_apport', label: t('admin.partenaires.apport'), render: (r) => <span className="text-xs">{r.type_apport || '—'}</span> },
    { key: 'message', label: t('admin.partenaires.message'), render: (r) => <span className="text-xs">{r.message || '—'}</span> },
    { key: 'statut', label: t('admin.partenaires.statut'), render: (r) => <AdminBadge value={r.statut} /> },
    { key: 'created_at', label: t('admin.partenaires.recue_le'), render: (r) => formatDate(r.created_at) },
    {
      key: 'actions', label: '',
      render: (r) => r.statut === 'en_attente' ? (
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => changer.mutate({ id: r.id, statut: 'validee' })}
                  className="text-xs font-semibold text-success hover:underline inline-flex items-center gap-1">
            <Check size={12} />{t('admin.partenaires.valider')}
          </button>
          <button onClick={() => changer.mutate({ id: r.id, statut: 'rejetee' })}
                  className="text-xs font-medium text-danger hover:underline inline-flex items-center gap-1">
            <X size={12} />{t('admin.partenaires.rejeter')}
          </button>
        </div>
      ) : (
        <button onClick={() => changer.mutate({ id: r.id, statut: 'en_attente' })}
                className="text-xs font-medium text-dim hover:text-primary hover:underline">{t('admin.partenaires.remettre_en_attente')}</button>
      ),
    },
  ]

  return (
    <>
      <p className="text-xs text-ghost mb-4">{t('admin.partenaires.avertissement_convention')}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { v: 'en_attente', l: t('admin.partenaires.en_attente') },
          { v: 'validee',    l: t('admin.partenaires.validees') },
          { v: 'rejetee',    l: t('admin.partenaires.rejetees') },
          { v: 'toutes',     l: t('admin.partenaires.toutes') },
        ].map((o) => (
          <button key={o.v} onClick={() => setStatut(o.v)}
            className={'text-xs font-semibold px-3 py-1.5 rounded-full border transition ' +
              (statut === o.v ? 'border-primary bg-primary/10 text-primary' : 'border-edge text-dim hover:border-primary')}>
            {o.l}
          </button>
        ))}
      </div>
      {isLoading ? <p className="text-sm text-ghost">{t('commun.chargement')}</p>
        : <AdminTable columns={colonnes} rows={rows} emptyLabel={t('admin.partenaires.aucune_candidature')} />}
    </>
  )
}

function OngletPartenaires() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminPartenaires()
  const rows = Array.isArray(data) ? data : (data?.data ?? [])

  const colonnes = [
    { key: 'nom',       label: t('admin.partenaires.nom'),      render: (r) => r.nom },
    { key: 'categorie', label: t('admin.partenaires.categorie'), render: (r) => r.categorie || '—' },
    { key: 'site_url',  label: t('admin.partenaires.site'),     render: (r) => r.site_url
        ? <a href={r.site_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">{t('admin.partenaires.ouvrir')}</a>
        : '—' },
    { key: 'actif',     label: t('admin.partenaires.actif'),    render: (r) => <AdminBadge value={r.actif ? 'actif' : 'inactif'} /> },
  ]

  return isLoading
    ? <p className="text-sm text-ghost">{t('commun.chargement')}</p>
    : <AdminTable columns={colonnes} rows={rows} emptyLabel={t('admin.partenaires.aucun_partenaire')} />
}

export default function PartenairesAdminPage() {
  const { t } = useTranslation()
  const [onglet, setOnglet] = useState('candidatures')

  const ONGLETS = [
    { cle: 'candidatures', libelle: t('admin.partenaires.onglet_candidatures') },
    { cle: 'partenaires',  libelle: t('admin.partenaires.onglet_partenaires') },
  ]

  return (
    <AdminLayout title={t('admin.partenaires.titre_page')}>
      <div className="flex gap-2 mb-5 border-b border-edge">
        {ONGLETS.map(({ cle, libelle }) => (
          <button key={cle} onClick={() => setOnglet(cle)}
            className={'text-sm font-semibold px-3 py-2 -mb-px border-b-2 transition ' +
              (onglet === cle ? 'border-primary text-primary' : 'border-transparent text-dim hover:text-ink')}>
            {libelle}
          </button>
        ))}
      </div>
      {onglet === 'candidatures' ? <OngletCandidatures /> : <OngletPartenaires />}
    </AdminLayout>
  )
}
