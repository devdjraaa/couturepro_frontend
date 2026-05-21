import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, AlignLeft, ArrowDownAZ, ClipboardList } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useClients, useCreateClient } from '@/hooks/useClients'
import { AppLayout } from '@/components/layout'
import { ClientCard, ClientForm } from '@/components/clients'
import { SearchBar, EmptyState, Skeleton, BottomSheet, Button } from '@/components/ui'
import { saveClientPhoto, deleteClientPhoto } from '@/utils/clientPhotoStorage'
import { cn } from '@/utils/cn'

const SORT_OPTIONS = [
  { key: 'recent',    label: 'Récents',          icon: AlignLeft    },
  { key: 'alpha',     label: 'A → Z',            icon: ArrowDownAZ  },
  { key: 'commandes', label: 'Commandes actives', icon: ClipboardList },
]

function SortChips({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
      {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
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
          {label}
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
  const [search, setSearch]   = useState('')
  const [sort, setSort]       = useState('recent')
  const [showSheet, setShowSheet] = useState(false)
  const [doublonError, setDoublonError] = useState(null)

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
    <AppLayout title={t('clients.titre')}>
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
                <p className="text-2xs font-semibold uppercase tracking-widest text-ghost px-1 mb-2">Favoris VIP</p>
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
                <p className="text-2xs font-semibold uppercase tracking-widest text-ghost px-1 mb-2">Favoris VIP</p>
                <div className="space-y-2 mb-4">
                  {favorites.map(client => (
                    <ClientCard key={client.id} client={client} onClick={() => navigate(`/clients/${client.id}`)} />
                  ))}
                </div>
                {nonFavorites.length > 0 && (
                  <p className="text-2xs font-semibold uppercase tracking-widest text-ghost px-1 mb-2">Tous les clients</p>
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

      {/* FAB ajouter client */}
      <button
        type="button"
        aria-label="Ajouter un client"
        onClick={() => setShowSheet(true)}
        className="fixed z-40 right-4 bottom-[calc(var(--bottom-nav-height)+1rem+var(--safe-area-bottom))] w-14 h-14 rounded-full bg-primary text-inverse flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-600 active:scale-90 transition-all duration-200 lg:hidden"
      >
        <Plus size={24} />
      </button>

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
      </BottomSheet>
    </AppLayout>
  )
}
