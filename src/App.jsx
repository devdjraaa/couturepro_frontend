import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, SyncIndicator } from '@/components/layout'
import {
  LoginPage, RegisterPage, OnboardingPage,
  DashboardPage,
  ClientsPage, ClientDetailPage,
  CommandesPage, CommandeDetailPage,
  CataloguePage, EquipePage, PointsPage,
  NotificationsPage, ParametresPage,
} from '@/pages'
import { ROUTES } from '@/constants/routes'

// Pages pas encore créées — placeholders temporaires
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-full p-8 text-content-secondary">
    {title} — page à implémenter
  </div>
)

export default function App() {
  return (
    <>
      <SyncIndicator />
      <Routes>
        {/* Routes publiques */}
        <Route path={ROUTES.LOGIN}           element={<LoginPage />}      />
        <Route path={ROUTES.REGISTER}        element={<RegisterPage />}   />
        <Route path={ROUTES.ONBOARDING}      element={<OnboardingPage />} />
        <Route path={ROUTES.OTP}             element={<PlaceholderPage title="Vérification OTP" />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<PlaceholderPage title="Mot de passe oublié" />} />
        <Route path={ROUTES.RECOVER_ACCOUNT} element={<PlaceholderPage title="Récupérer mon compte" />} />

        {/* Routes protégées */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.DASHBOARD}        element={<DashboardPage />}      />

          {/* Clients */}
          <Route path={ROUTES.CLIENTS}          element={<ClientsPage />}        />
          <Route path={ROUTES.CLIENT_DETAIL}    element={<ClientDetailPage />}   />

          {/* Commandes — /commandes/new AVANT /:id pour matcher en premier */}
          <Route path={ROUTES.COMMANDE_NEW}     element={<CommandesPage />}      />
          <Route path={ROUTES.COMMANDE_DETAIL}  element={<CommandeDetailPage />} />
          <Route path={ROUTES.COMMANDES}        element={<CommandesPage />}      />

          {/* Vêtements */}
          <Route path={ROUTES.VETEMENTS}        element={<CataloguePage />}      />

          {/* Abonnement */}
          <Route path={ROUTES.ABONNEMENT}       element={<PlaceholderPage title="Abonnement" />} />

          {/* Fidélité */}
          <Route path={ROUTES.POINTS}           element={<PointsPage />}         />

          {/* Équipe */}
          <Route path={ROUTES.EQUIPE}           element={<EquipePage />}         />

          {/* Notifications */}
          <Route path={ROUTES.NOTIFICATIONS}    element={<NotificationsPage />}  />

          {/* Paramètres */}
          <Route path={ROUTES.PARAMETRES}       element={<ParametresPage />}     />
          <Route path={ROUTES.PROFIL}           element={<PlaceholderPage title="Mon profil" />} />
          <Route path={ROUTES.COMMUNICATIONS}   element={<PlaceholderPage title="Communications" />} />
          <Route path={ROUTES.THEME}            element={<PlaceholderPage title="Thème" />} />
          <Route path={ROUTES.APROPOS}          element={<PlaceholderPage title="À propos" />} />

          {/* Autres */}
          <Route path={ROUTES.PHOTOS_VIP}       element={<PlaceholderPage title="Photos VIP" />} />
          <Route path={ROUTES.HISTORIQUE}       element={<PlaceholderPage title="Historique" />} />
          <Route path={ROUTES.FAQ}              element={<PlaceholderPage title="FAQ" />} />
          <Route path={ROUTES.CONTACT}          element={<PlaceholderPage title="Contact" />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </>
  )
}
