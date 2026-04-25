const COLORS = {
  actif:      'bg-green-100 text-green-700',
  active:     'bg-green-100 text-green-700',
  gele:       'bg-blue-100 text-blue-700',
  expire:     'bg-gray-100 text-gray-600',
  pending:    'bg-yellow-100 text-yellow-700',
  completed:  'bg-green-100 text-green-700',
  failed:     'bg-red-100 text-red-700',
  refunded:   'bg-purple-100 text-purple-700',
  ouvert:     'bg-blue-100 text-blue-700',
  en_cours:   'bg-yellow-100 text-yellow-700',
  ferme:      'bg-gray-100 text-gray-600',
  disponible: 'bg-green-100 text-green-700',
  annule:     'bg-red-100 text-red-600',
  super_admin:'bg-indigo-100 text-indigo-700',
  moderateur: 'bg-blue-100 text-blue-700',
  support:    'bg-teal-100 text-teal-700',
}

export default function AdminBadge({ value }) {
  const cls = COLORS[value] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {value}
    </span>
  )
}
