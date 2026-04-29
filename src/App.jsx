import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, SyncIndicator } from '@/components/layout'
import { AdminProtectedRoute } from '@/components/admin'
import {
  LoginPage, RegisterPage, OnboardingPage,
  DashboardPage,
  ClientsPage, ClientDetailPage,
  CommandesPage, CommandeDetailPage,
  CataloguePage, EquipePage, PointsPage,
  NotificationsPage, ParametresPage, CommunicationsPage,
  SupportPage, SupportTicketDetailPage, ThemePage,
} from '@/pages'
import PaiementRetourPage     from '@/pages/PaiementRetourPage'
import OtpPage                from '@/pages/auth/OtpPage'
import ForgotPasswordPage     from '@/pages/auth/ForgotPasswordPage'
import RecoverAccountPage     from '@/pages/auth/RecoverAccountPage'
import ProfilPage             from '@/pages/ProfilPage'
import AProposPage            from '@/pages/AProposPage'
import FAQPage                from '@/pages/FAQPage'
import ContactPage            from '@/pages/ContactPage'
import HistoriquePage         from '@/pages/HistoriquePage'
import ArchivesPage           from '@/pages/ArchivesPage'
import CaissePage             from '@/pages/CaissePage'
import { FeatureGate } from '@/components/abonnement'
import { AppLayout } from '@/components/layout'
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
import AdminParametresPage    from '@/pages/admin/AdminParametresPage'
import AdminsPage             from '@/pages/admin/AdminsPage'

const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-full p-8 text-content-secondary">
    {title} — page à implémenter
  </div>
)

// Redirections vers ParametresPage pour l'abonnement
const AbonnementRedirect = () => <Navigate to={`${ROUTES.PARAMETRES}?tab=abonnement`} replace />

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
          <Route path="/admin/parametres"       element={<AdminParametresPage />} />
          <Route path="/admin/admins"           element={<AdminsPage />} />
        </Route>

        {/* ── Routes publiques proprietaire ───────────────────────────── */}
        <Route path={ROUTES.LOGIN}           element={<LoginPage />}      />
        <Route path={ROUTES.REGISTER}        element={<RegisterPage />}   />
        <Route path={ROUTES.ONBOARDING}      element={<OnboardingPage />} />
        <Route path={ROUTES.OTP}             element={<OtpPage />}             />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />}  />
        <Route path={ROUTES.RECOVER_ACCOUNT} element={<RecoverAccountPage />}  />
        <Route path="/paiement/retour"       element={<PaiementRetourPage />} />

        {/* ── Routes protégées proprietaire ───────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.DASHBOARD}        element={<DashboardPage />}      />

          <Route path={ROUTES.CLIENTS}          element={<ClientsPage />}        />
          <Route path={ROUTES.CLIENT_DETAIL}    element={<ClientDetailPage />}   />

          <Route path={ROUTES.COMMANDE_NEW}     element={<CommandesPage />}      />
          <Route path={ROUTES.COMMANDE_DETAIL}  element={<CommandeDetailPage />} />
          <Route path={ROUTES.COMMANDES}        element={<CommandesPage />}      />

          <Route path={ROUTES.VETEMENTS}        element={<CataloguePage />}      />
          <Route path={ROUTES.ABONNEMENT}       element={<AbonnementRedirect />} />
          <Route path={ROUTES.POINTS}           element={<PointsPage />}         />
          <Route path={ROUTES.EQUIPE}           element={<EquipePage />}         />
          <Route path={ROUTES.NOTIFICATIONS}    element={<NotificationsPage />}  />
          <Route path={ROUTES.PARAMETRES}       element={<ParametresPage />}     />
          <Route path={ROUTES.PROFIL}           element={<ProfilPage />}          />
          <Route path={ROUTES.COMMUNICATIONS}   element={<CommunicationsPage />} />
          <Route path={ROUTES.THEME}            element={<ThemePage />}                       />
          <Route path={ROUTES.APROPOS}          element={<AProposPage />}         />
          <Route path={ROUTES.PHOTOS_VIP}       element={
            <AppLayout showBack title="Photos VIP">
              <div className="p-4">
                <FeatureGate featureKey="photos_vip" featureName="Photos VIP" />
              </div>
            </AppLayout>
          } />
          <Route path={ROUTES.HISTORIQUE}       element={<HistoriquePage />}      />
          <Route path="/archives"               element={<ArchivesPage />}        />
          <Route path="/caisse"                 element={<CaissePage />}          />
          <Route path={ROUTES.FAQ}              element={<FAQPage />}             />
          <Route path={ROUTES.CONTACT}          element={<ContactPage />}         />
          <Route path={ROUTES.SUPPORT}          element={<SupportPage />}                     />
          <Route path={ROUTES.SUPPORT_TICKET}   element={<SupportTicketDetailPage />}         />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </>
  )
}
