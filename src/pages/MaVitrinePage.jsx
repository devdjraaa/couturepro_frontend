import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Store, ExternalLink, Copy, Check, Eye, MessageCircle,
  Sparkles, ClipboardList, Wallet, Image as ImageIcon,
} from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts'
import { useDashboard } from '@/hooks/useDashboard'
import { vetementService } from '@/services/vetementService'
import { formatCurrency } from '@/utils/formatCurrency'
import { IS_NATIVE } from '@/constants/routes'

function Kpi({ icon: Icon, label, value, hint }) {
  return (
    <div className="bg-card border border-edge rounded-xl p-4">
      <div className="flex items-center gap-2 text-dim text-xs font-medium">
        <Icon size={15} className="text-primary" /> {label}
      </div>
      <div className="text-2xl font-bold font-display text-ink mt-1">{value}</div>
      {hint && <div className="text-2xs text-ghost mt-0.5">{hint}</div>}
    </div>
  )
}

export default function MaVitrinePage() {
  const { atelier } = useAuth()
  const dash = useDashboard()
  const [creations, setCreations] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let on = true
    vetementService.getAll()
      .then((list) => { if (on) setCreations((list || []).filter((v) => !v.is_systeme)) })
      .catch(() => { if (on) setCreations([]) })
    return () => { on = false }
  }, [])

  const publicPath = atelier?.id ? `/createurs/${atelier.id}` : '/createurs'
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}${publicPath}` : publicPath
  const nbCreations = creations?.length ?? null

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard indisponible */ }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 pb-24 lg:pb-8">

        {/* En-tête */}
        <div className="pt-4 pb-3">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <Store size={15} /> Espace public
          </div>
          <h1 className="text-2xl font-bold font-display text-ink mt-1">Ma Vitrine</h1>
          <p className="text-sm text-dim mt-0.5">Votre présence sur la marketplace Gextimo.</p>
        </div>

        {/* Carte page publique */}
        <div className="rounded-2xl p-5 text-white bg-[#0D0D0D]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white/60 text-xs">Votre page publique</p>
              <p className="font-bold font-display text-lg truncate">{atelier?.nom ?? 'Mon atelier'}</p>
              <p className="text-white/50 text-xs mt-0.5 truncate">{publicUrl}</p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
              ● En ligne
            </span>
          </div>
          <div className="flex gap-2 mt-4">
            {IS_NATIVE ? (
              <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-600 transition">
                <ExternalLink size={16} /> Voir ma page
              </a>
            ) : (
              <Link to={publicPath}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-600 transition">
                <ExternalLink size={16} /> Voir ma page
              </Link>
            )}
            <button onClick={copyLink}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 transition">
              {copied ? <><Check size={16} /> Copié !</> : <><Copy size={16} /> Copier le lien</>}
            </button>
          </div>
        </div>

        {/* KPIs réels */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <Kpi icon={Sparkles} label="Créations" value={nbCreations ?? '—'} hint="visibles sur votre page" />
          <Kpi icon={ClipboardList} label="Commandes en cours" value={dash.isLoading ? '—' : dash.en_cours} />
          <Kpi icon={Wallet} label="Encaissé ce mois" value={dash.isLoading ? '—' : formatCurrency(dash.total_encaisse)} />
        </div>

        {/* Stats publiques — à venir (tracking backend non disponible) */}
        <div className="mt-4 bg-subtle border border-edge rounded-xl p-4">
          <p className="text-sm font-semibold text-ink mb-3">Statistiques publiques</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Eye, label: 'Visites' },
              { icon: Store, label: 'Consultations' },
              { icon: MessageCircle, label: 'Contacts reçus' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <s.icon size={18} className="mx-auto text-ghost" />
                <div className="text-lg font-bold text-ghost mt-1">—</div>
                <div className="text-2xs text-ghost">{s.label}</div>
                <div className="text-[10px] font-semibold text-primary mt-0.5">Bientôt</div>
              </div>
            ))}
          </div>
        </div>

        {/* Créations */}
        <div className="flex items-center justify-between mt-6 mb-3">
          <h2 className="text-lg font-bold font-display text-ink">Vos créations</h2>
          <Link to="/catalogue" className="text-sm font-semibold text-primary hover:underline">Gérer →</Link>
        </div>

        {creations === null ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : creations.length === 0 ? (
          <div className="bg-card border border-edge rounded-xl p-8 text-center">
            <ImageIcon size={28} className="mx-auto text-ghost" />
            <p className="text-sm text-dim mt-2">Aucune création pour le moment.</p>
            <Link to="/catalogue" className="inline-flex mt-3 text-sm font-semibold text-primary hover:underline">Ajouter une création</Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {creations.map((v) => (
              <div key={v.id} className="bg-card border border-edge rounded-xl overflow-hidden">
                <div className="aspect-square bg-subtle flex items-center justify-center overflow-hidden">
                  {v.image_url
                    ? <img src={v.image_url} alt={v.nom} className="w-full h-full object-cover" />
                    : <ImageIcon size={22} className="text-ghost" />}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-ink truncate">{v.nom}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-2xs text-ghost mt-4 leading-relaxed">
          Toutes vos créations actives apparaissent automatiquement sur votre page publique.
          Le contrôle fin de la publication (brouillon / retirer de la vitrine) et les statistiques
          de visites arrivent prochainement.
        </p>
      </div>
    </AppLayout>
  )
}
