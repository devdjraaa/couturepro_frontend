import { useAuth } from '@/contexts'

const frFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// Formate un montant en XOF : "125 000 XOF"
// Le composant doit appliquer font-mono à l'affichage
export function formatCurrency(amount, currency = 'XOF') {
  if (amount === null || amount === undefined || isNaN(amount)) return '—'
  return `${frFormatter.format(amount)} ${currency}`
}

// Formate sans l'unité : "125 000"
export function formatAmount(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—'
  return frFormatter.format(amount)
}

// Calcule le reste à payer
export function calculerReste(montant, avance = 0) {
  return Math.max(0, (montant || 0) - (avance || 0))
}

// Pourcentage d'avance payée
export function pourcentageAvance(montant, avance) {
  if (!montant || montant === 0) return 0
  return Math.min(100, Math.round(((avance || 0) / montant) * 100))
}

// Hook React — retourne un formatter qui utilise la devise de l'atelier connecté
export function useFormatCurrency() {
  const { atelier } = useAuth()
  const devise = atelier?.devise ?? 'XOF'
  return (amount) => formatCurrency(amount, devise)
}
