import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import api from '@/services/api'
import { Button } from '@/components/ui'

export default function PaiementRetourPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const fedapayId = searchParams.get('id')
  const [statut, setStatut] = useState('chargement') // chargement | completed | failed | inconnu

  useEffect(() => {
    if (!fedapayId) {
      setStatut('inconnu')
      return
    }

    api.get('/paiements/retour', { params: { id: fedapayId } })
      .then(({ data }) => setStatut(data.statut === 'completed' ? 'completed' : 'failed'))
      .catch(() => setStatut('inconnu'))
  }, [fedapayId])

  const goHome = () => navigate('/parametres', { replace: true })

  if (statut === 'chargement') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <Loader2 size={36} className="animate-spin text-primary" />
        <p className="text-sm text-dim">Vérification du paiement…</p>
      </div>
    )
  }

  if (statut === 'completed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 text-center">
        <CheckCircle size={56} className="text-success" />
        <div>
          <h1 className="text-xl font-bold text-ink mb-1">Paiement confirmé !</h1>
          <p className="text-sm text-dim">Votre abonnement a été activé avec succès.</p>
        </div>
        <Button onClick={goHome} className="w-full max-w-xs">
          Retour à l'application
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 text-center">
      <XCircle size={56} className="text-danger" />
      <div>
        <h1 className="text-xl font-bold text-ink mb-1">Paiement échoué</h1>
        <p className="text-sm text-dim">
          {statut === 'inconnu'
            ? 'Impossible de vérifier le statut de ce paiement.'
            : 'Le paiement n\'a pas abouti. Vous pouvez réessayer.'}
        </p>
      </div>
      <Button onClick={goHome} variant="secondary" className="w-full max-w-xs">
        Retour aux paramètres
      </Button>
    </div>
  )
}
