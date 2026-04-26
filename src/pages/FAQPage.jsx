import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { cn } from '@/utils/cn'

const FAQ = [
  {
    q: 'Comment ajouter un nouveau client ?',
    a: 'Allez dans la section Clients, puis appuyez sur le bouton + en bas à droite. Renseignez le nom, le prénom et le numéro de téléphone du client.',
  },
  {
    q: 'Comment enregistrer les mesures d\'un client ?',
    a: 'Ouvrez la fiche client, faites défiler vers la section Mesures et appuyez sur "Modifier les mesures". Vous pouvez saisir toutes les mensurations et les enregistrer.',
  },
  {
    q: 'Comment créer une commande ?',
    a: 'Appuyez sur le bouton + depuis le tableau de bord ou la page Commandes. Sélectionnez le client, le type de vêtement, le prix et la date de livraison prévue.',
  },
  {
    q: 'Comment enregistrer un paiement client ?',
    a: 'Depuis le détail d\'une commande, faites défiler vers la section Paiements et appuyez sur "Ajouter un paiement". Indiquez le montant et le mode de paiement.',
  },
  {
    q: 'Comment ajouter un membre à mon équipe ?',
    a: 'Allez dans Paramètres → Équipe, puis appuyez sur l\'icône + en haut à droite. Un code d\'accès unique sera généré pour le nouveau membre.',
  },
  {
    q: 'Comment un membre de l\'équipe se connecte-t-il ?',
    a: 'Sur la page de connexion, appuyez sur l\'onglet "Assistant / Membre". Saisissez le code d\'accès fourni par le propriétaire. Le mot de passe initial est identique au code d\'accès.',
  },
  {
    q: 'Comment renouveler mon abonnement ?',
    a: 'Allez dans Paramètres → Abonnement. Vous y trouverez les plans disponibles avec un bouton pour choisir ou renouveler votre abonnement via FedaPay.',
  },
  {
    q: 'Mes données sont-elles sauvegardées automatiquement ?',
    a: 'Oui, toutes les données sont synchronisées avec notre serveur en temps réel dès que vous avez une connexion internet.',
  },
  {
    q: 'Comment envoyer un rappel WhatsApp à un client ?',
    a: 'Depuis la fiche client, appuyez sur l\'icône WhatsApp. L\'application génère un message pré-rempli que vous n\'avez plus qu\'à envoyer.',
  },
  {
    q: 'Comment convertir mes points de fidélité ?',
    a: 'Allez dans la section Points de fidélité. Si vous avez atteint le seuil de conversion, vous verrez un bouton "Convertir en jours d\'abonnement". Chaque conversion vous offre 31 jours supplémentaires.',
  },
]

function FaqItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-card border border-edge rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-3 px-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-ink leading-snug">{item.q}</span>
        <ChevronDown
          size={16}
          className={cn('shrink-0 mt-0.5 text-dim transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-edge">
          <p className="text-sm text-dim leading-relaxed pt-3">{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <AppLayout title="FAQ" showBack>
      <div className="p-4 space-y-2">
        <p className="text-sm text-dim text-center pb-2">Questions fréquentes</p>
        {FAQ.map(item => (
          <FaqItem key={item.q} item={item} />
        ))}
      </div>
    </AppLayout>
  )
}
