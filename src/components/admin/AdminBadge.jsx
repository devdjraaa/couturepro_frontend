const COLORS = {
  actif:       'bg-success/10 text-success',
  active:      'bg-success/10 text-success',
  gele:        'bg-primary/10 text-primary',
  expire:      'bg-subtle text-ghost border border-edge',
  pending:     'bg-warning/10 text-warning',
  completed:   'bg-success/10 text-success',
  failed:      'bg-danger/10  text-danger',
  refunded:    'bg-accent/10  text-accent',
  ouvert:      'bg-primary/10 text-primary',
  en_cours:    'bg-warning/10 text-warning',
  ferme:       'bg-subtle text-ghost border border-edge',
  disponible:  'bg-success/10 text-success',
  annule:      'bg-danger/10  text-danger',
  super_admin: 'bg-primary/10 text-primary',
  admin:       'bg-info/10    text-info',
  moderateur:  'bg-info/10    text-info',
  support:     'bg-accent/10  text-accent',
  inactif:     'bg-danger/10  text-danger',
}

export default function AdminBadge({ value }) {
  const cls = COLORS[value] ?? 'bg-subtle text-ghost'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {value}
    </span>
  )
}
