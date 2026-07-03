import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Plus, X, UserPlus, Users, AlignLeft, ArrowDownAZ, ClipboardList, BookUser, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useClients, useCreateClient } from '@/hooks/useClients'
import { clientService } from '@/services/clientService'
import { AppLayout } from '@/components/layout'
import { ClientCard, ClientForm } from '@/components/clients'
import { SearchBar, EmptyState, Skeleton, BottomSheet, Button } from '@/components/ui'
import { saveClientPhoto, deleteClientPhoto } from '@/utils/clientPhotoStorage'
import { cn } from '@/utils/cn'

// #3-5 — Import contacts téléphone via Capacitor Contacts
async function pickContacts() {
  try {
    const { Contacts } = await import('@capacitor-community/contacts')
    const perm = await Contacts.requestPermissions()
    if (perm.contacts !== 'granted') {
      toast.error("Permission d'accès aux contacts refusée.")
      return []
    }
    const { contacts } = await Contacts.getContacts({
      projection: { name: true, phones: true },
    })
    return contacts.map(c => {
      // ⚠️ `||` (pas `??`) : beaucoup de contacts ont familyName/givenName = '' (vide, pas null),
      // ce que `??` ne rattrape pas → nom vide → le backend rejette tout le lot.
      const family  = (c.name?.familyName || '').trim()
      const given   = (c.name?.givenName  || '').trim()
      const display = (c.name?.display    || '').trim()
      const tel     = (c.phones?.[0]?.number || '').replace(/\s/g, '')
      // nom toujours non-vide : famille → nom affiché → prénom → téléphone
      const nom     = family || display || given || tel
      // prénom seulement s'il ne fait pas doublon avec le nom
      const prenom  = family ? given : ''
      return { nom, prenom, telephone: tel }
    }).filter(c => c.nom && c.telephone)
  } catch {
    toast.error("Import contacts non disponible sur cette plateforme.")
    return []
  }
}

const SORT_OPTIONS = [
  { key: 'recent',    tKey: 'clients.tri.recent',   icon: AlignLeft    },
  { key: 'alpha',     tKey: 'clients.tri.alpha',    icon: ArrowDownAZ  },
  { key: 'commandes', tKey: 'clients.tri.commandes', icon: ClipboardList },
]

function SortChips({ active, onChange }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
      {SORT_OPTIONS.map(({ key, tKey, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            active === key
              ? 'bg-primary text-inverse'
              : 'bg-subtle text-ghost hover:text-ink',
          )}
        >
          <Icon size={12} />
          {t(tKey)}
        </button>
      ))}
    </div>
  )
}

function AlphaIndex({ letters, onJump }) {
  return (
    <div className="fixed right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-0.5 lg:hidden">
      {letters.map(l => (
        <button
          key={l}
          type="button"
          onClick={() => onJump(l)}
          className="w-5 h-5 flex items-center justify-center text-2xs font-semibold text-primary hover:text-primary-700"
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export default function ClientsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [search, setSearch]   = useState('')
  const [sort, setSort]       = useState('recent')
  const [showSheet, setShowSheet] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [doublonError, setDoublonError] = useState(null)
  // #3-5 — Import contacts
  const [contactsToImport, setContactsToImport] = useState(null)  // null | Contact[]
  const [selectedContacts, setSelectedContacts] = useState(new Set())
  const [importing, setImporting] = useState(false)

  const { data: clients = [], isLoading } = useClients()
  const createClient = useCreateClient()

  const filtered = useMemo(() => {
    let list = clients.filter(c =>
      `${c.prenom ?? ''} ${c.nom}`.toLowerCase().includes(search.toLowerCase()) ||
      c.telephone?.includes(search)
    )

    if (sort === 'alpha') {
      list = [...list].sort((a, b) =>
        `${a.prenom ?? ''} ${a.nom}`.localeCompare(`${b.prenom ?? ''} ${b.nom}`, 'fr')
      )
    } else if (sort === 'commandes') {
      list = [...list].sort((a, b) => (b.commandes_count ?? 0) - (a.commandes_count ?? 0))
    }
    // 'recent' = API order (default)

    return list
  }, [clients, search, sort])

  const alphaLetters = useMemo(() => {
    if (sort !== 'alpha' || filtered.length <= 30) return []
    return [...new Set(filtered.map(c => (`${c.prenom ?? ''} ${c.nom}`).trim()[0]?.toUpperCase()).filter(Boolean))]
  }, [filtered, sort])

  const handleJump = (letter) => {
    const el = document.getElementById(`alpha-${letter}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Lancer la sélection de contacts
  const handleOpenContacts = async () => {
    const contacts = await pickContacts()
    if (contacts.length === 0) return
    setContactsToImport(contacts)
    setSelectedContacts(new Set(contacts.map((_, i) => i)))
  }

  // Importer les contacts sélectionnés
  const handleImportContacts = async () => {
    if (selectedContacts.size === 0) return
    setImporting(true)
    try {
      const contacts = [...selectedContacts].map(idx => contactsToImport[idx])
      // Le backend limite à 200 contacts par requête → on découpe en lots et on agrège.
      const CHUNK = 200
      let imported = 0, skipped = 0
      for (let i = 0; i < contacts.length; i += CHUNK) {
        const res = await clientService.importBatch(contacts.slice(i, i + CHUNK))
        imported += res?.imported ?? 0
        skipped  += res?.skipped ?? 0
      }
      queryClient.invalidateQueries()
      toast.success(t('clients.import_resultat', { imported, skipped }))
    } catch {
      toast.error(t('clients.import_erreur'))
    }
    setImporting(false)
    setContactsToImport(null)
    setSelectedContacts(new Set())
  }

  const handleCreate = async ({ _photo, ...data }) => {
    setDoublonError(null)
    try {
      const client = await createClient.mutateAsync(data)
      if (_photo === '__remove__') deleteClientPhoto(client.id)
      else if (_photo) saveClientPhoto(client.id, _photo)
      setShowSheet(false)
    } catch (err) {
      if (err.code === 'doublon') setDoublonError(err.message)
      else throw err
    }
  }

  const groupedByLetter = useMemo(() => {
    if (sort !== 'alpha' || filtered.length <= 30) return null
    const groups = {}
    filtered.forEach(c => {
      const letter = (`${c.prenom ?? ''} ${c.nom}`).trim()[0]?.toUpperCase() ?? '#'
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(c)
    })
    return groups
  }, [filtered, sort])

  const favorites = filtered.filter(c => c.is_vip)
  const nonFavorites = groupedByLetter ? null : filtered.filter(c => !c.is_vip)

  return (
    <AppLayout title={t('clients.titre')} onRefresh={() => queryClient.invalidateQueries()}>
      <div className="p-4 space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder={t('clients.recherche_placeholder')} />

        {!isLoading && clients.length > 0 && (
          <SortChips active={sort} onChange={setSort} />
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? t('commun.aucun_resultat') : t('clients.vide.titre')}
            description={search ? '' : t('clients.vide.description')}
            primaryAction={!search ? (
              <Button onClick={() => setShowSheet(true)}>
                Ajouter un client
              </Button>
            ) : undefined}
          />
        ) : groupedByLetter ? (
          /* Vue alphabétique avec index pour > 30 clients */
          <>
            {alphaLetters.length > 0 && <AlphaIndex letters={alphaLetters} onJump={handleJump} />}
            {favorites.length > 0 && (
              <div>
                <p className="text-2xs font-semibold uppercase tracking-widest text-ghost px-1 mb-2">{t('clients.vip_titre')}</p>
                <div className="space-y-2">
                  {favorites.map(client => (
                    <ClientCard key={client.id} client={client} onClick={() => navigate(`/clients/${client.id}`)} />
                  ))}
                </div>
              </div>
            )}
            {Object.entries(groupedByLetter).map(([letter, group]) => (
              <div key={letter} id={`alpha-${letter}`}>
                <p className="text-2xs font-semibold uppercase tracking-widest text-ghost px-1 mb-2">{letter}</p>
                <div className="space-y-2">
                  {group.map(client => (
                    <ClientCard key={client.id} client={client} onClick={() => navigate(`/clients/${client.id}`)} />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          /* Vue normale */
          <>
            {favorites.length > 0 && !search && (
              <div>
                <p className="text-2xs font-semibold uppercase tracking-widest text-ghost px-1 mb-2">{t('clients.vip_titre')}</p>
                <div className="space-y-2 mb-4">
                  {favorites.map(client => (
                    <ClientCard key={client.id} client={client} onClick={() => navigate(`/clients/${client.id}`)} />
                  ))}
                </div>
                {nonFavorites.length > 0 && (
                  <p className="text-2xs font-semibold uppercase tracking-widest text-ghost px-1 mb-2">{t('clients.tous_titre')}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              {(favorites.length > 0 && !search ? nonFavorites : filtered).map(client => (
                <ClientCard key={client.id} client={client} onClick={() => navigate(`/clients/${client.id}`)} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAB speed-dial (Nouveau client + Importer contacts).
          Rendu via portal dans <body> pour rester FIXÉ au viewport : sinon l'ancêtre
          .animate-page-enter (transform persistant) casserait le position:fixed. */}
      {createPortal(
        <div className="lg:hidden">
          {/* Backdrop quand ouvert */}
          {fabOpen && (
            <button
              type="button"
              aria-label={t('commun.fermer')}
              onClick={() => setFabOpen(false)}
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px] animate-fade-in"
            />
          )}

          <div className="fixed z-50 right-4 bottom-[calc(var(--bottom-nav-height)+1rem+var(--safe-area-bottom))] flex flex-col items-end gap-3">
            {/* Actions (visibles quand ouvert) */}
            {fabOpen && (
              <>
                <button
                  type="button"
                  onClick={() => { setFabOpen(false); handleOpenContacts() }}
                  className="flex items-center gap-2 pl-4 pr-3 h-11 rounded-full bg-card border border-edge text-ink shadow-lg active:scale-95 transition-transform animate-fab-item"
                >
                  <span className="text-sm font-medium">{t('clients.importer_contacts')}</span>
                  <span className="w-8 h-8 rounded-full bg-accent/15 text-accent-600 flex items-center justify-center"><BookUser size={16} /></span>
                </button>
                <button
                  type="button"
                  onClick={() => { setFabOpen(false); setShowSheet(true) }}
                  className="flex items-center gap-2 pl-4 pr-3 h-11 rounded-full bg-card border border-edge text-ink shadow-lg active:scale-95 transition-transform animate-fab-item"
                >
                  <span className="text-sm font-medium">{t('clients.nouveau')}</span>
                  <span className="w-8 h-8 rounded-full bg-primary/12 text-primary flex items-center justify-center"><UserPlus size={16} /></span>
                </button>
              </>
            )}

            {/* Bouton principal (opaque) */}
            <button
              type="button"
              aria-label={t('clients.ajouter_aria')}
              onClick={() => setFabOpen(o => !o)}
              className="w-14 h-14 rounded-full bg-primary text-inverse flex items-center justify-center shadow-xl shadow-primary/40 hover:bg-primary-600 active:scale-90 transition-all duration-200"
            >
              <Plus size={24} className={cn('transition-transform duration-200', fabOpen && 'rotate-45')} />
            </button>
          </div>
        </div>,
        document.body,
      )}

      <BottomSheet
        isOpen={showSheet}
        onClose={() => { setShowSheet(false); setDoublonError(null) }}
        title={t('clients.formulaire.titre_ajout')}
      >
        {doublonError && (
          <p className="mx-5 mt-3 text-sm text-danger bg-danger/8 rounded-xl px-4 py-2.5">
            {doublonError}
          </p>
        )}
        <ClientForm
          onSubmit={handleCreate}
          onCancel={() => { setShowSheet(false); setDoublonError(null) }}
          isLoading={createClient.isPending}
        />
        {/* #5 — Bouton import contacts dans le form */}
        <button
          type="button"
          onClick={handleOpenContacts}
          className="w-full flex items-center justify-center gap-2 mt-3 mb-4 mx-auto text-sm text-ghost hover:text-primary transition-colors"
        >
          <BookUser size={15} />
          Importer depuis les contacts
        </button>
      </BottomSheet>

      {/* #3-4 — Popup de confirmation import contacts */}
      <BottomSheet
        isOpen={!!contactsToImport}
        onClose={() => { setContactsToImport(null); setSelectedContacts(new Set()) }}
        title={`Importer des contacts (${selectedContacts.size} sélectionné${selectedContacts.size > 1 ? 's' : ''})`}
      >
        <div className="px-4 pb-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {(contactsToImport ?? []).map((c, idx) => {
            const selected = selectedContacts.has(idx)
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedContacts(prev => {
                  const next = new Set(prev)
                  selected ? next.delete(idx) : next.add(idx)
                  return next
                })}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors',
                  selected ? 'border-primary/40 bg-primary-50' : 'border-edge bg-card',
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{`${c.prenom} ${c.nom}`.trim()}</p>
                  {c.telephone && <p className="text-xs text-ghost">{c.telephone}</p>}
                </div>
                {selected && <Check size={16} className="text-primary shrink-0" />}
              </button>
            )
          })}
        </div>
        <div className="flex gap-3 px-4 pb-6">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => { setContactsToImport(null); setSelectedContacts(new Set()) }}
          >
            Annuler
          </Button>
          <Button
            className="flex-1"
            loading={importing}
            disabled={selectedContacts.size === 0}
            onClick={handleImportContacts}
          >
            Importer ({selectedContacts.size})
          </Button>
        </div>
      </BottomSheet>
    </AppLayout>
  )
}
