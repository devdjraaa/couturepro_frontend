import { useState } from 'react'
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

const ONGLETS = [
  { cle: 'candidatures', libelle: 'Candidatures' },
  { cle: 'partenaires',  libelle: 'Partenaires' },
]

function OngletCandidatures() {
  const [statut, setStatut] = useState('en_attente')
  // Sans filtre le serveur renvoie tout : « toutes » passe donc un objet vide.
  const { data, isLoading } = useCandidaturesPartenaires(statut === 'toutes' ? {} : { statut })
  const changer = useStatutCandidature()

  const rows = Array.isArray(data) ? data : (data?.data ?? [])

  const colonnes = [
    { key: 'nom_organisation', label: 'Organisation', render: (r) => (
        <div>
          <p className="font-medium text-ink">{r.nom_organisation}</p>
          {r.pays_region && <p className="text-xs text-ghost">{r.pays_region}</p>}
        </div>
      ) },
    { key: 'contact', label: 'Contact', render: (r) => (
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
    { key: 'categorie_souhaitee', label: 'Catégorie', render: (r) => r.categorie_souhaitee || '—' },
    { key: 'type_apport', label: 'Apport', render: (r) => <span className="text-xs">{r.type_apport || '—'}</span> },
    { key: 'message', label: 'Message', render: (r) => <span className="text-xs">{r.message || '—'}</span> },
    { key: 'statut', label: 'Statut', render: (r) => <AdminBadge value={r.statut} /> },
    { key: 'created_at', label: 'Reçue le', render: (r) => formatDate(r.created_at) },
    {
      key: 'actions', label: '',
      render: (r) => r.statut === 'en_attente' ? (
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => changer.mutate({ id: r.id, statut: 'validee' })}
                  className="text-xs font-semibold text-success hover:underline inline-flex items-center gap-1">
            <Check size={12} />Valider
          </button>
          <button onClick={() => changer.mutate({ id: r.id, statut: 'rejetee' })}
                  className="text-xs font-medium text-danger hover:underline inline-flex items-center gap-1">
            <X size={12} />Rejeter
          </button>
        </div>
      ) : (
        <button onClick={() => changer.mutate({ id: r.id, statut: 'en_attente' })}
                className="text-xs font-medium text-dim hover:text-primary hover:underline">Remettre en attente</button>
      ),
    },
  ]

  return (
    <>
      <p className="text-xs text-ghost mb-4">
        Valider une candidature ne déclenche aucun envoi automatique : la convention reste à transmettre à la main.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {[{ v: 'en_attente', l: 'En attente' }, { v: 'validee', l: 'Validées' }, { v: 'rejetee', l: 'Rejetées' }, { v: 'toutes', l: 'Toutes' }].map((o) => (
          <button key={o.v} onClick={() => setStatut(o.v)}
            className={'text-xs font-semibold px-3 py-1.5 rounded-full border transition ' +
              (statut === o.v ? 'border-primary bg-primary/10 text-primary' : 'border-edge text-dim hover:border-primary')}>
            {o.l}
          </button>
        ))}
      </div>
      {isLoading ? <p className="text-sm text-ghost">Chargement…</p>
        : <AdminTable columns={colonnes} rows={rows} emptyLabel="Aucune candidature" />}
    </>
  )
}

function OngletPartenaires() {
  const { data, isLoading } = useAdminPartenaires()
  const rows = Array.isArray(data) ? data : (data?.data ?? [])

  const colonnes = [
    { key: 'nom',       label: 'Nom',       render: (r) => r.nom },
    { key: 'categorie', label: 'Catégorie', render: (r) => r.categorie || '—' },
    { key: 'site_url',  label: 'Site',      render: (r) => r.site_url
        ? <a href={r.site_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">Ouvrir</a>
        : '—' },
    { key: 'actif',     label: 'Actif',     render: (r) => <AdminBadge value={r.actif ? 'actif' : 'inactif'} /> },
  ]

  return isLoading
    ? <p className="text-sm text-ghost">Chargement…</p>
    : <AdminTable columns={colonnes} rows={rows} emptyLabel="Aucun partenaire" />
}

export default function PartenairesAdminPage() {
  const [onglet, setOnglet] = useState('candidatures')

  return (
    <AdminLayout title="Partenaires">
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
