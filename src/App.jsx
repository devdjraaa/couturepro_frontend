import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, SyncIndicator } from '@/components/layout'
import { AdminProtectedRoute } from '@/components/admin'
import {
  LoginPage, RegisterPage, OnboardingPage,
  DashboardPage,
  ClientsPage, ClientDetailPage,
  CommandesPage, CommandeDetailPage,
  CataloguePage, EquipePage, PointsPage,
  NotificationsPage, ParametresPage,
} from '@/pages'
import { ROUTES } from '@/constants/routes'

// Pages admin
import AdminLoginPage          from '@/pages/admin/AdminLoginPage'
import AdminDashboardPage      from '@/pages/admin/AdminDashboardPage'
import AteliersPage            from '@/pages/admin/AteliersPage'
import AtelierDetailPage       from '@/pages/admin/AtelierDetailPage'
import PlansPage               from '@/pages/admin/PlansPage'
import TransactionsPage        from '@/pages/admin/TransactionsPage'
import AdminPaiementsPage      from '@/pages/admin/AdminPaiementsPage'
import TicketsPage             from '@/pages/admin/TicketsPage'
import TicketDetailPage        from '@/pages/admin/TicketDetailPage'
import OffresPage              from '@/pages/admin/OffresPage'
import ListeNoirePage          from '@/pages/admin/ListeNoirePage'
import AuditPage               from '@/pages/admin/AuditPage'
import AdminNotificationsPage  from '@/pages/admin/AdminNotificationsPage'

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

        {/* ── Routes admin ────────────────────────────────────────────── */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin"                  element={<AdminDashboardPage />} />
          <Route path="/admin/ateliers"         element={<AteliersPage />} />
          <Route path="/admin/ateliers/:id"     element={<AtelierDetailPage />} />
          <Route path="/admin/plans"            element={<PlansPage />} />
          <Route path="/admin/transactions"     element={<TransactionsPage />} />
          <Route path="/admin/paiements"        element={<AdminPaiementsPage />} />
          <Route path="/admin/tickets"          element={<TicketsPage />} />
          <Route path="/admin/tickets/:id"      element={<TicketDetailPage />} />
          <Route path="/admin/offres"           element={<OffresPage />} />
          <Route path="/admin/liste-noire"      element={<ListeNoirePage />} />
          <Route path="/admin/audit"            element={<AuditPage />} />
          <Route path="/admin/notifications"    element={<AdminNotificationsPage />} />
        </Route>

        {/* ── Routes publiques proprietaire ───────────────────────────── */}
        <Route path={ROUTES.LOGIN}           element={<LoginPage />}      />
        <Route path={ROUTES.REGISTER}        element={<RegisterPage />}   />
        <Route path={ROUTES.ONBOARDING}      element={<OnboardingPage />} />
        <Route path={ROUTES.OTP}             element={<PlaceholderPage title="Vérification OTP" />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<PlaceholderPage title="Mot de passe oublié" />} />
        <Route path={ROUTES.RECOVER_ACCOUNT} element={<PlaceholderPage title="Récupérer mon compte" />} />

        {/* ── Routes protégées proprietaire ───────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.DASHBOARD}        element={<DashboardPage />}      />

          <Route path={ROUTES.CLIENTS}          element={<ClientsPage />}        />
          <Route path={ROUTES.CLIENT_DETAIL}    element={<ClientDetailPage />}   />

          <Route path={ROUTES.COMMANDE_NEW}     element={<CommandesPage />}      />
          <Route path={ROUTES.COMMANDE_DETAIL}  element={<CommandeDetailPage />} />
          <Route path={ROUTES.COMMANDES}        element={<CommandesPage />}      />

          <Route path={ROUTES.VETEMENTS}        element={<CataloguePage />}      />
          <Route path={ROUTES.ABONNEMENT}       element={<PlaceholderPage title="Abonnement" />} />
          <Route path={ROUTES.POINTS}           element={<PointsPage />}         />
          <Route path={ROUTES.EQUIPE}           element={<EquipePage />}         />
          <Route path={ROUTES.NOTIFICATIONS}    element={<NotificationsPage />}  />
          <Route path={ROUTES.PARAMETRES}       element={<ParametresPage />}     />
          <Route path={ROUTES.PROFIL}           element={<PlaceholderPage title="Mon profil" />} />
          <Route path={ROUTES.COMMUNICATIONS}   element={<PlaceholderPage title="Communications" />} />
          <Route path={ROUTES.THEME}            element={<PlaceholderPage title="Thème" />} />
          <Route path={ROUTES.APROPOS}          element={<PlaceholderPage title="À propos" />} />
          <Route path={ROUTES.PHOTOS_VIP}       element={<PlaceholderPage title="Photos VIP" />} />
          <Route path={ROUTES.HISTORIQUE}       element={<PlaceholderPage title="Historique" />} />
          <Route path={ROUTES.FAQ}              element={<PlaceholderPage title="FAQ" />} />
          <Route path={ROUTES.CONTACT}          element={<PlaceholderPage title="Contact" />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </>
  )
}
