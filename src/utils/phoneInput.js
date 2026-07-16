// P66 : saisie téléphone — on n'autorise que les chiffres et un « + » en tête.
// (espaces tolérés pour la lisibilité, le backend normalise ensuite.)
export function sanitizePhoneInput(value) {
  if (!value) return ''
  // Conserver un éventuel + de tête, retirer tout caractère non [0-9 espace].
  const plus = value.trimStart().startsWith('+') ? '+' : ''
  const reste = value.replace(/[^\d\s]/g, '')
  return plus + reste
}
