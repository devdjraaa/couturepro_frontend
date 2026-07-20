import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Plus, Trash2, Phone, Clock, Check, X, Megaphone, Calculator, Video, ExternalLink } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { TabBar, Button, EmptyState, Skeleton, Input } from '@/components/ui'
import { FeatureGate } from '@/components/abonnement'
import { studioService } from '@/services/studioService'
import { collectionService } from '@/services/collectionService'
import { useFormatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const STATUTS = ['en_attente', 'contacte', 'converti', 'annule']
const STATUT_COLOR = {
  en_attente: 'bg-warning/10 text-warning',
  contacte: 'bg-primary/10 text-primary',
  converti: 'bg-success/10 text-success',
  annule: 'bg-subtle text-ghost',
}

// PL-4 — Liste d'attente clients
function ListeAttenteTab({ t }) {
  const [items, setItems] = useState(null)
  const [form, setForm] = useState({ nom: '', telephone: '', note: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { setItems(await studioService.listeAttente()) } catch { setItems([]) }
  }
  useEffect(() => { load() }, [])

  const ajouter = async (e) => {
    e.preventDefault()
    if (!form.nom.trim()) return
    setSaving(true)
    try {
      await studioService.ajouterAttente(form)
      setForm({ nom: '', telephone: '', note: '' })
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || t('studio.erreur'))
    } finally { setSaving(false) }
  }

  const changerStatut = async (item, statut) => {
    try { await studioService.majAttente(item.id, { statut }); load() } catch { /* silencieux */ }
  }

  const retirer = async (item) => {
    if (!window.confirm(t('studio.attente.confirmer_retrait'))) return
    try { await studioService.retirerAttente(item.id); load() } catch { /* silencieux */ }
  }

  if (items === null) return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>

  return (
    <div className="space-y-4">
      <form onSubmit={ajouter} className="bg-card border border-edge rounded-xl p-4 space-y-3">
        <Input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder={t('studio.attente.nom')} />
        <Input value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} placeholder={t('studio.attente.telephone')} inputMode="tel" />
        <Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder={t('studio.attente.note')} />
        <Button type="submit" loading={saving} icon={Plus} className="w-full">{t('studio.attente.ajouter')}</Button>
      </form>

      {items.length === 0 ? (
        <EmptyState icon={Clock} title={t('studio.attente.vide')} description={t('studio.attente.vide_sous')} />
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-card border border-edge rounded-xl p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{item.nom}</p>
                  {item.telephone && <a href={`tel:${item.telephone}`} className="text-xs text-primary flex items-center gap-1"><Phone size={11} /> {item.telephone}</a>}
                  {item.note && <p className="text-xs text-dim mt-0.5 line-clamp-2">{item.note}</p>}
                </div>
                <button onClick={() => retirer(item)} className="text-danger shrink-0"><Trash2 size={15} /></button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-edge">
                {STATUTS.map(s => (
                  <button key={s} onClick={() => changerStatut(item, s)}
                    className={cn('text-2xs px-2 py-0.5 rounded-full', item.statut === s ? STATUT_COLOR[s] : 'bg-subtle text-ghost')}>
                    {t(`studio.attente.statuts.${s}`)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// PL-5 — Simulateur de revenus (calcul local, sans backend)
function SimulateurTab({ t }) {
  const fmt = useFormatCurrency()
  const [nbCmd, setNbCmd] = useState(20)
  const [panier, setPanier] = useState(15000)
  const [charges, setCharges] = useState(50000)
  const [tauxHausse, setTauxHausse] = useState(10)

  const caMensuel = (Number(nbCmd) || 0) * (Number(panier) || 0)
  const beneficeMensuel = caMensuel - (Number(charges) || 0)
  const caAnnuel = caMensuel * 12
  const projeteAnnuel = caMensuel * 12 * (1 + (Number(tauxHausse) || 0) / 100)

  const Champ = ({ label, value, set, suffix }) => (
    <label className="block">
      <span className="text-xs text-dim">{label}</span>
      <div className="flex items-center gap-2 mt-1">
        <Input type="number" value={value} onChange={e => set(e.target.value)} className="flex-1" />
        {suffix && <span className="text-xs text-ghost">{suffix}</span>}
      </div>
    </label>
  )

  return (
    <div className="space-y-4">
      <div className="bg-card border border-edge rounded-xl p-4 space-y-3">
        <Champ label={t('studio.simulateur.nb_commandes')} value={nbCmd} set={setNbCmd} suffix="/ mois" />
        <Champ label={t('studio.simulateur.panier')} value={panier} set={setPanier} suffix="FCFA" />
        <Champ label={t('studio.simulateur.charges')} value={charges} set={setCharges} suffix="FCFA / mois" />
        <Champ label={t('studio.simulateur.hausse')} value={tauxHausse} set={setTauxHausse} suffix="%" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-subtle rounded-xl p-3">
          <p className="text-xs text-dim">{t('studio.simulateur.ca_mensuel')}</p>
          <p className="text-base font-bold text-ink">{fmt(caMensuel)}</p>
        </div>
        <div className="bg-subtle rounded-xl p-3">
          <p className="text-xs text-dim">{t('studio.simulateur.benefice')}</p>
          <p className={cn('text-base font-bold', beneficeMensuel >= 0 ? 'text-success' : 'text-danger')}>{fmt(beneficeMensuel)}</p>
        </div>
        <div className="bg-subtle rounded-xl p-3">
          <p className="text-xs text-dim">{t('studio.simulateur.ca_annuel')}</p>
          <p className="text-base font-bold text-ink">{fmt(caAnnuel)}</p>
        </div>
        <div className="bg-primary/10 rounded-xl p-3">
          <p className="text-xs text-primary">{t('studio.simulateur.projete')}</p>
          <p className="text-base font-bold text-primary">{fmt(projeteAnnuel)}</p>
        </div>
      </div>
      <p className="text-2xs text-ghost text-center">{t('studio.simulateur.avertissement')}</p>
    </div>
  )
}

// PL-6 — Annonce de collection
function AnnonceTab({ t }) {
  const [collections, setCollections] = useState(null)
  const [selected, setSelected] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    collectionService.getAll().then(setCollections).catch(() => setCollections([]))
  }, [])

  const annoncer = async () => {
    if (!selected) { toast(t('studio.annonce.choisir')); return }
    setSending(true)
    try {
      await studioService.annoncerCollection(selected, { message })
      toast.success(t('studio.annonce.envoyee'))
      setMessage('')
    } catch (err) {
      toast.error(err?.response?.data?.message || t('studio.erreur'))
    } finally { setSending(false) }
  }

  if (collections === null) return <Skeleton className="h-40 rounded-xl" />
  if (collections.length === 0) return <EmptyState icon={Megaphone} title={t('studio.annonce.aucune_collection')} description={t('studio.annonce.aucune_collection_sous')} />

  return (
    <div className="space-y-4">
      <div className="bg-card border border-edge rounded-xl p-4 space-y-3">
        <label className="block">
          <span className="text-xs text-dim">{t('studio.annonce.collection')}</span>
          <select value={selected} onChange={e => setSelected(e.target.value)}
            className="w-full mt-1 rounded-xl border border-edge bg-card px-3 py-2 text-sm text-ink">
            <option value="">{t('studio.annonce.choisir')}</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
          placeholder={t('studio.annonce.message')}
          className="w-full rounded-xl border border-edge bg-card px-3 py-2 text-sm text-ink resize-none" />
        <Button onClick={annoncer} loading={sending} icon={Megaphone} className="w-full">{t('studio.annonce.publier')}</Button>
      </div>
      <p className="text-2xs text-ghost text-center">{t('studio.annonce.aide')}</p>
    </div>
  )
}

// PL-7 — Vidéos de présentation
function VideosTab({ t }) {
  const [items, setItems] = useState(null)
  const [form, setForm] = useState({ titre: '', url: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { setItems(await studioService.videos()) } catch { setItems([]) }
  }
  useEffect(() => { load() }, [])

  const ajouter = async (e) => {
    e.preventDefault()
    if (!form.url.trim()) return
    setSaving(true)
    try {
      await studioService.ajouterVideo(form)
      setForm({ titre: '', url: '' })
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || t('studio.erreur'))
    } finally { setSaving(false) }
  }

  const retirer = async (item) => {
    if (!window.confirm(t('studio.videos.confirmer_retrait'))) return
    try { await studioService.retirerVideo(item.id); load() } catch { /* silencieux */ }
  }

  if (items === null) return <Skeleton className="h-40 rounded-xl" />

  return (
    <div className="space-y-4">
      <form onSubmit={ajouter} className="bg-card border border-edge rounded-xl p-4 space-y-3">
        <Input value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} placeholder={t('studio.videos.titre')} />
        <Input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder={t('studio.videos.url')} inputMode="url" />
        <Button type="submit" loading={saving} icon={Plus} className="w-full">{t('studio.videos.ajouter')}</Button>
      </form>
      <p className="text-2xs text-ghost text-center">{t('studio.videos.aide', { n: items.length })}</p>

      {items.length === 0 ? (
        <EmptyState icon={Video} title={t('studio.videos.vide')} description={t('studio.videos.vide_sous')} />
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-card border border-edge rounded-xl p-3 flex items-center justify-between gap-2">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex items-center gap-2 text-sm text-primary">
                <Video size={15} className="shrink-0" />
                <span className="truncate">{item.titre || item.url}</span>
                <ExternalLink size={12} className="shrink-0 opacity-60" />
              </a>
              <button onClick={() => retirer(item)} className="text-danger shrink-0"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const TABS = [
  { key: 'attente', feature: 'liste_attente', icon: Clock },
  { key: 'simulateur', feature: 'simulateur_revenus', icon: Calculator },
  { key: 'annonce', feature: 'annonce_collection', icon: Megaphone },
  { key: 'videos', feature: 'videos_presentation', icon: Video },
]

export default function StudioPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('attente')
  const feature = TABS.find(x => x.key === tab)

  return (
    <AppLayout title={t('studio.titre')}>
      <TabBar
        tabs={TABS.map(x => ({ key: x.key, label: t(`studio.tabs.${x.key}`) }))}
        activeTab={tab}
        onChange={setTab}
      />
      <div className="p-4">
        {/* FeatureGate affiche le contenu si le plan l'inclut, sinon la carte d'upgrade. */}
        <FeatureGate featureKey={feature.feature} featureName={t(`studio.tabs.${tab}`)}>
          {tab === 'attente'
            ? <ListeAttenteTab t={t} />
            : tab === 'simulateur'
              ? <SimulateurTab t={t} />
              : tab === 'annonce'
                ? <AnnonceTab t={t} />
                : <VideosTab t={t} />}
        </FeatureGate>
      </div>
    </AppLayout>
  )
}
