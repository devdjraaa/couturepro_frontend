import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Users, ClipboardList, Scissors } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { useCommandes } from '@/hooks/useCommandes'
import { useVetements } from '@/hooks/useVetements'
import Avatar from '@/components/ui/Avatar'
import ClientAvatar from '@/components/clients/ClientAvatar'

function ResultGroup({ icon: Icon, title, children }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 px-4 py-1.5">
        <Icon size={11} className="text-ghost" />
        <p className="text-2xs font-semibold text-ghost uppercase tracking-widest">{title}</p>
      </div>
      <div className="divide-y divide-edge">{children}</div>
    </div>
  )
}

export default function GlobalSearch({ isOpen, onClose }) {
  const navigate  = useNavigate()
  const inputRef  = useRef(null)
  const [query, setQuery] = useState('')

  const { data: clients   = [] } = useClients()
  const { data: commandes = [] } = useCommandes()
  const { data: vetements = [] } = useVetements()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Bloquer le scroll du body quand ouvert
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const q = query.toLowerCase().trim()

  const results = useMemo(() => {
    if (!q) return null
    return {
      clients: clients.filter(c =>
        `${c.prenom ?? ''} ${c.nom}`.toLowerCase().includes(q) ||
        c.telephone?.includes(q)
      ).slice(0, 4),
      commandes: commandes.filter(c =>
        c.client_nom?.toLowerCase().includes(q) ||
        c.vetement_nom?.toLowerCase().includes(q)
      ).slice(0, 4),
      vetements: vetements.filter(v =>
        v.nom?.toLowerCase().includes(q)
      ).slice(0, 3),
    }
  }, [q, clients, commandes, vetements])

  const hasResults = results &&
    (results.clients.length + results.commandes.length + results.vetements.length) > 0

  const go = (path) => {
    navigate(path)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-app">
      {/* Barre de recherche */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-edge bg-card pt-safe shrink-0">
        <Search size={17} className="text-ghost shrink-0" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Client, commande, modèle…"
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ghost focus:outline-none"
        />
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-ghost hover:text-ink transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Résultats */}
      <div className="flex-1 overflow-y-auto py-2">
        {!q ? (
          <p className="text-sm text-ghost text-center pt-16">Commencez à taper…</p>
        ) : !hasResults ? (
          <p className="text-sm text-ghost text-center pt-16">
            Aucun résultat pour « {query} »
          </p>
        ) : (
          <>
            {results.clients.length > 0 && (
              <ResultGroup icon={Users} title="Clients">
                {results.clients.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => go(`/clients/${c.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-subtle transition-colors text-left"
                  >
                    <ClientAvatar client={c} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {`${c.prenom ?? ''} ${c.nom}`.trim()}
                      </p>
                      <p className="text-xs text-ghost">{c.telephone}</p>
                    </div>
                  </button>
                ))}
              </ResultGroup>
            )}

            {results.commandes.length > 0 && (
              <ResultGroup icon={ClipboardList} title="Commandes">
                {results.commandes.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => go(`/commandes/${c.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-subtle transition-colors text-left"
                  >
                    <Avatar name={c.client_nom} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{c.client_nom}</p>
                      <p className="text-xs text-ghost truncate">{c.vetement_nom}</p>
                    </div>
                  </button>
                ))}
              </ResultGroup>
            )}

            {results.vetements.length > 0 && (
              <ResultGroup icon={Scissors} title="Modèles">
                {results.vetements.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => go('/catalogue/modeles')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-subtle transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <Scissors size={14} className="text-primary-700" />
                    </div>
                    <p className="text-sm font-medium text-ink">{v.nom}</p>
                  </button>
                ))}
              </ResultGroup>
            )}
          </>
        )}
      </div>
    </div>
  )
}
