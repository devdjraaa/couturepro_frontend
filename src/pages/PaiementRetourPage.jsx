import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '@/services/api'
import { Button } from '@/components/ui'

export default function PaiementRetourPage() {
  const { t } = useTranslation()
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
        <p className="text-sm text-dim">{t('paiement_retour.chargement')}</p>
      </div>
    )
  }

  if (statut === 'completed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 text-center">
        <CheckCircle size={56} className="text-success" />
        <div>
          <h1 className="text-xl font-bold text-ink mb-1">{t('paiement_retour.succes_titre')}</h1>
          <p className="text-sm text-dim">{t('paiement_retour.succes_desc')}</p>
        </div>
        <Button onClick={goHome} className="w-full max-w-xs">
          {t('paiement_retour.retour_app')}
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 text-center">
      <XCircle size={56} className="text-danger" />
      <div>
        <h1 className="text-xl font-bold text-ink mb-1">{t('paiement_retour.echec_titre')}</h1>
        <p className="text-sm text-dim">
          {statut === 'inconnu'
            ? t('paiement_retour.echec_inconnu')
            : t('paiement_retour.echec_desc')}
        </p>
      </div>
      <Button onClick={goHome} variant="secondary" className="w-full max-w-xs">
        {t('paiement_retour.retour_params')}
      </Button>
    </div>
  )
}
