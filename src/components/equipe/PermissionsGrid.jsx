import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'
import { usePermissions, useUpdatePermissions } from '@/hooks/useEquipe'
import { Button } from '@/components/ui'

const GROUPES = [
  {
    label: 'Clients',
    actions: [
      { perm: 'clients.view',    label: 'Consulter' },
      { perm: 'clients.create',  label: 'Créer'     },
      { perm: 'clients.archive', label: 'Archiver'  },
      { perm: 'clients.edit',    label: 'Modifier'  },
      { perm: 'clients.delete',  label: 'Supprimer' },
    ],
  },
  {
    label: 'Commandes',
    actions: [
      { perm: 'commandes.view',    label: 'Consulter' },
      { perm: 'commandes.create',  label: 'Créer'     },
      { perm: 'commandes.archive', label: 'Archiver'  },
      { perm: 'commandes.edit',    label: 'Modifier'  },
      { perm: 'commandes.delete',  label: 'Supprimer' },
    ],
  },
  {
    label: 'Mesures',
    actions: [
      { perm: 'mesures.view',    label: 'Consulter' },
      { perm: 'mesures.archive', label: 'Archiver'  },
      { perm: 'mesures.edit',    label: 'Modifier'  },
    ],
  },
  {
    label: 'Catalogue',
    actions: [
      { perm: 'vetements.manage', label: 'Gérer' },
    ],
  },
  {
    label: 'Paiements',
    actions: [
      { perm: 'paiements.view',   label: 'Consulter'    },
      { perm: 'paiements.create', label: 'Enregistrer'  },
    ],
  },
  {
    label: 'Points fidélité',
    actions: [
      { perm: 'points.convert', label: 'Convertir' },
    ],
  },
  {
    label: 'Notifications',
    actions: [
      { perm: 'notifications.view', label: 'Consulter' },
    ],
  },
]

function RoleColumn({ role, label, perms, onChange }) {
  return (
    <div className="flex-1">
      <p className="text-xs font-semibold text-dim uppercase tracking-wide text-center mb-3">{label}</p>
      {GROUPES.map(g => (
        <div key={g.label} className="mb-3">
          <p className="text-[10px] text-ghost font-medium mb-1 px-1">{g.label}</p>
          {g.actions.map(({ perm, label: aLabel }) => {
            const checked = perms.includes(perm)
            return (
              <label
                key={perm}
                className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-subtle cursor-pointer"
              >
                <span className="text-xs text-ink">{aLabel}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => onChange(perm, e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                />
              </label>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function PermissionsGrid() {
  const { data: assistantData } = usePermissions('assistant')
  const { data: membreData }    = usePermissions('membre')
  const update = useUpdatePermissions()

  const [assistantPerms, setAssistantPerms] = useState([])
  const [membrePerms,    setMembrePerms]    = useState([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (assistantData?.permissions) setAssistantPerms(assistantData.permissions)
  }, [assistantData])

  useEffect(() => {
    if (membreData?.permissions) setMembrePerms(membreData.permissions)
  }, [membreData])

  const toggleAssistant = (perm, val) =>
    setAssistantPerms(p => val ? [...p, perm] : p.filter(x => x !== perm))

  const toggleMembre = (perm, val) =>
    setMembrePerms(p => val ? [...p, perm] : p.filter(x => x !== perm))

  const handleSave = async () => {
    setSaved(false)
    await Promise.all([
      update.mutateAsync({ role: 'assistant', permissions: assistantPerms }),
      update.mutateAsync({ role: 'membre',    permissions: membrePerms }),
    ])
    setSaved(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 bg-primary/5 rounded-xl px-3 py-2.5">
        <Shield size={14} className="text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-dim">
          Ces permissions s'appliquent à tous les membres du rôle correspondant dans votre atelier.
        </p>
      </div>

      <div className="flex gap-4">
        <RoleColumn role="assistant" label="Assistant"  perms={assistantPerms} onChange={toggleAssistant} />
        <div className="w-px bg-edge shrink-0" />
        <RoleColumn role="membre"    label="Membre"     perms={membrePerms}    onChange={toggleMembre}    />
      </div>

      {saved && (
        <p className="text-xs text-success text-center">Permissions enregistrées.</p>
      )}

      <Button
        onClick={handleSave}
        loading={update.isPending}
        className="w-full"
      >
        Enregistrer les permissions
      </Button>
    </div>
  )
}
