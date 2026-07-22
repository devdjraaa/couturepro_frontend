import { useState } from 'react'
import { Check, EyeOff, RotateCcw, Star, Megaphone, Video } from 'lucide-react'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import {
  useAdminAvis, useAvisCompteurs, useMasquerAvis, useRetablirAvis, useModererPhotosAvis,
  useAdminAnnonces, useAnnoncesCompteurs, useMasquerAnnonce, useRetablirAnnonce,
  useAdminVideos, useVideosCompteurs, useApprouverVideo, useRefuserVideo,
} from '@/hooks/admin/useModeration'
import { formatDate } from '@/utils/formatDate'

/**
 * File de modération des contenus créateurs — avis, annonces, vidéos.
 *
 * Ces routes existaient côté serveur mais aucun écran ne les appelait : les
 * contenus signalés s'empilaient sans que personne puisse trancher. C'est le
 * pendant indispensable du retrait de la sanction automatique — on ne punit
 * plus tout seul, donc il faut pouvoir punir à la main.
 *
 * Chaque retrait demande un MOTIF : il est repris tel quel dans l'avis envoyé
 * au créateur. Retirer un contenu sans dire pourquoi n'est pas modérer.
 */

const ONGLETS = [
  { cle: 'avis',     libelle: 'Avis',     icone: Star },
  { cle: 'annonces', libelle: 'Annonces', icone: Megaphone },
  { cle: 'videos',   libelle: 'Vidéos',   icone: Video },
]

function Compteurs({ valeurs }) {
  const entrees = Object.entries(valeurs || {})
  if (entrees.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {entrees.map(([cle, n]) => (
        <span key={cle} className="text-xs px-2.5 py-1 rounded-full bg-subtle text-dim">
          {cle.replace(/_/g, ' ')} <b className="text-ink tabular-nums">{n ?? 0}</b>
        </span>
      ))}
    </div>
  )
}

function Filtres({ options, actif, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={'text-xs font-semibold px-3 py-1.5 rounded-full border transition ' +
            (actif === o.v ? 'border-primary bg-primary/10 text-primary' : 'border-edge text-dim hover:border-primary')}>
          {o.l}
        </button>
      ))}
    </div>
  )
}

/** Demande le motif avant d'agir — le serveur l'exige et le créateur le lira. */
function demanderMotif(question) {
  const motif = window.prompt(question)
  if (motif === null) return null
  const propre = motif.trim()
  return propre.length > 0 ? propre : null
}

function OngletAvis() {
  const [filtre, setFiltre] = useState('signales')
  const { data, isLoading } = useAdminAvis({ filtre })
  const { data: compteurs } = useAvisCompteurs()
  const masquer  = useMasquerAvis()
  const retablir = useRetablirAvis()
  const photos   = useModererPhotosAvis()

  const rows = data?.data ?? data ?? []

  const colonnes = [
    { key: 'atelier', label: 'Créateur', render: (r) => r.atelier?.nom ?? '—' },
    { key: 'note',    label: 'Note',     render: (r) => <span className="tabular-nums">{r.note ?? '—'}</span> },
    { key: 'commentaire', label: 'Avis', render: (r) => <span className="text-xs">{r.commentaire || '—'}</span> },
    { key: 'signalements_count', label: 'Signalé', render: (r) => <span className="tabular-nums">{r.signalements_count ?? 0}</span> },
    { key: 'statut',  label: 'Statut',   render: (r) => <AdminBadge value={r.statut} /> },
    { key: 'created_at', label: 'Date',  render: (r) => formatDate(r.created_at) },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex items-center gap-3 justify-end">
          {filtre === 'photos' ? (
            <>
              <button onClick={() => photos.mutate({ id: r.id, action: 'valider' })}
                      className="text-xs font-medium text-success hover:underline">Valider les photos</button>
              <button onClick={() => photos.mutate({ id: r.id, action: 'refuser' })}
                      className="text-xs font-medium text-danger hover:underline">Refuser</button>
            </>
          ) : r.statut === 'masque' ? (
            <button onClick={() => retablir.mutate(r.id)}
                    className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
              <RotateCcw size={12} />Rétablir
            </button>
          ) : (
            <button
              onClick={() => { const m = demanderMotif('Motif du retrait (facultatif) :'); masquer.mutate({ id: r.id, motif: m }) }}
              className="text-xs font-semibold text-danger hover:underline inline-flex items-center gap-1">
              <EyeOff size={12} />Masquer
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <Compteurs valeurs={compteurs} />
      <Filtres actif={filtre} onChange={setFiltre} options={[
        { v: 'signales', l: 'Signalés' }, { v: 'photos', l: 'Photos à valider' }, { v: 'masques', l: 'Masqués' },
      ]} />
      {isLoading ? <p className="text-sm text-ghost">Chargement…</p>
        : <AdminTable columns={colonnes} rows={rows} emptyLabel="Aucun avis à modérer" />}
    </>
  )
}

function OngletAnnonces() {
  const [filtre, setFiltre] = useState('signalees')
  const { data, isLoading } = useAdminAnnonces({ filtre })
  const { data: compteurs } = useAnnoncesCompteurs()
  const masquer  = useMasquerAnnonce()
  const retablir = useRetablirAnnonce()

  const rows = data?.data ?? data ?? []

  const colonnes = [
    { key: 'atelier', label: 'Créateur', render: (r) => r.atelier?.nom ?? '—' },
    { key: 'titre',   label: 'Titre',    render: (r) => r.titre || '—' },
    { key: 'message', label: 'Message',  render: (r) => <span className="text-xs">{r.message || '—'}</span> },
    { key: 'signalements_count', label: 'Signalé', render: (r) => <span className="tabular-nums">{r.signalements_count ?? 0}</span> },
    { key: 'statut',  label: 'Statut',   render: (r) => <AdminBadge value={r.masquee_at ? 'masquee' : r.statut} /> },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex justify-end">
          {r.masquee_at ? (
            <button onClick={() => retablir.mutate(r.id)}
                    className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
              <RotateCcw size={12} />Rétablir
            </button>
          ) : (
            <button
              onClick={() => {
                // Le serveur EXIGE le motif ici : il est recopié dans la
                // notification envoyée au créateur.
                const m = demanderMotif('Motif du retrait (obligatoire) :')
                if (m) masquer.mutate({ id: r.id, motif: m })
              }}
              className="text-xs font-semibold text-danger hover:underline inline-flex items-center gap-1">
              <EyeOff size={12} />Retirer
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <Compteurs valeurs={compteurs} />
      <Filtres actif={filtre} onChange={setFiltre} options={[
        { v: 'signalees', l: 'Signalées' }, { v: 'masquees', l: 'Masquées' },
      ]} />
      {isLoading ? <p className="text-sm text-ghost">Chargement…</p>
        : <AdminTable columns={colonnes} rows={rows} emptyLabel="Aucune annonce à modérer" />}
    </>
  )
}

function OngletVideos() {
  const [statut, setStatut] = useState('en_attente')
  const { data, isLoading } = useAdminVideos({ statut })
  const { data: compteurs } = useVideosCompteurs()
  const approuver = useApprouverVideo()
  const refuser   = useRefuserVideo()

  const rows = data?.data ?? data ?? []

  const colonnes = [
    { key: 'atelier', label: 'Créateur', render: (r) => r.atelier?.nom ?? '—' },
    { key: 'titre',   label: 'Titre',    render: (r) => r.titre || '—' },
    { key: 'url',     label: 'Lien',     render: (r) => r.url
        ? <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-primary underline break-all">Ouvrir</a>
        : '—' },
    { key: 'statut',  label: 'Statut',   render: (r) => <AdminBadge value={r.statut} /> },
    { key: 'created_at', label: 'Date',  render: (r) => formatDate(r.created_at) },
    {
      key: 'actions', label: '',
      render: (r) => r.statut === 'en_attente' ? (
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => approuver.mutate(r.id)}
                  className="text-xs font-semibold text-success hover:underline inline-flex items-center gap-1">
            <Check size={12} />Publier
          </button>
          <button
            onClick={() => {
              // Motif obligatoire côté serveur : le créateur doit savoir pourquoi.
              const m = demanderMotif('Motif du refus (obligatoire) :')
              if (m) refuser.mutate({ id: r.id, motif: m })
            }}
            className="text-xs font-semibold text-danger hover:underline">Refuser</button>
        </div>
      ) : <Check size={13} className="text-ghost" aria-hidden="true" />,
    },
  ]

  return (
    <>
      <Compteurs valeurs={compteurs} />
      <Filtres actif={statut} onChange={setStatut} options={[
        { v: 'en_attente', l: 'À valider' }, { v: 'publiee', l: 'Publiées' }, { v: 'refusee', l: 'Refusées' },
      ]} />
      {isLoading ? <p className="text-sm text-ghost">Chargement…</p>
        : <AdminTable columns={colonnes} rows={rows} emptyLabel="Aucune vidéo" />}
    </>
  )
}

export default function ModerationPage() {
  const [onglet, setOnglet] = useState('avis')

  return (
    <AdminLayout title="Modération des contenus">
      <div className="flex gap-2 mb-5 border-b border-edge">
        {ONGLETS.map(({ cle, libelle, icone: Icone }) => (
          <button key={cle} onClick={() => setOnglet(cle)}
            className={'inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 -mb-px border-b-2 transition ' +
              (onglet === cle ? 'border-primary text-primary' : 'border-transparent text-dim hover:text-ink')}>
            <Icone size={14} aria-hidden="true" />{libelle}
          </button>
        ))}
      </div>

      {onglet === 'avis' && <OngletAvis />}
      {onglet === 'annonces' && <OngletAnnonces />}
      {onglet === 'videos' && <OngletVideos />}
    </AdminLayout>
  )
}
