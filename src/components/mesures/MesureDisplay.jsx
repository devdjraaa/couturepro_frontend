const FIELDS = [
  { key: 'poitrine',          label: 'Poitrine'       },
  { key: 'tour_de_taille',    label: 'Tour de taille' },
  { key: 'hanches',           label: 'Hanches'        },
  { key: 'longueur_dos',      label: 'Longueur dos'   },
  { key: 'epaules',           label: 'Épaules'        },
  { key: 'longueur_manche',   label: 'Lg. manche'     },
  { key: 'tour_de_bras',      label: 'Tour de bras'   },
  { key: 'longueur_robe',     label: 'Lg. robe'       },
  { key: 'tour_de_cuisse',    label: 'Tour cuisse'    },
  { key: 'longueur_pantalon', label: 'Lg. pantalon'   },
  { key: 'tour_de_cou',       label: 'Tour de cou'    },
]

export default function MesureDisplay({ mesures }) {
  if (!mesures) return null

  const filled = FIELDS.filter(f => mesures[f.key] != null)

  return (
    <div className="p-5">
      {filled.length === 0 ? (
        <p className="text-sm text-ghost text-center py-4">Aucune mesure enregistrée</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {filled.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between border-b border-edge pb-2">
              <span className="text-xs text-dim">{label}</span>
              <span className="text-sm font-semibold text-ink font-mono">{mesures[key]} cm</span>
            </div>
          ))}
        </div>
      )}
      {mesures.notes && (
        <p className="mt-4 text-sm text-dim bg-subtle rounded-xl px-3 py-2 italic">{mesures.notes}</p>
      )}
    </div>
  )
}
