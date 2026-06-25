import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout'
import { AdminProtectedRoute } from '@/components/admin'
import {
  LoginPage, RegisterPage, OnboardingPage,
  DashboardPage,
  ClientsPage, ClientDetailPage,
  CommandesPage, CommandeDetailPage, NouvelleCommandePage,
  NouvelleCommandeGroupeePage, CommandeGroupeDetailPage,
  AtelierPage, CataloguePage, EquipePage, PointsPage,
  NotificationsPage, ParametresPage, CommunicationsPage,
  SupportPage, SupportTicketDetailPage, ThemePage,
} from '@/pages'
import PaiementRetourPage     from '@/pages/PaiementRetourPage'
import OtpPage                  from '@/pages/auth/OtpPage'
import ForgotPasswordPage       from '@/pages/auth/ForgotPasswordPage'
import RecoverAccountPage       from '@/pages/auth/RecoverAccountPage'
import LoginQuestionSecretePage from '@/pages/auth/LoginQuestionSecretePage'
import ArtisanAppPage           from '@/pages/auth/ArtisanAppPage'
import ProfilPage             from '@/pages/ProfilPage'
import MaVitrinePage          from '@/pages/MaVitrinePage'
import AProposPage            from '@/pages/AProposPage'
import FAQPage                from '@/pages/FAQPage'
import ContactPage            from '@/pages/ContactPage'
import FacturationPage        from '@/pages/FacturationPage'
import HistoriquePage         from '@/pages/HistoriquePage'
import ArchivesPage           from '@/pages/ArchivesPage'
import CaissePage             from '@/pages/CaissePage'
import GaleriePage            from '@/pages/GaleriePage'
import { FeatureGate } from '@/components/abonnement'
import { AppLayout } from '@/components/layout'
import { ROUTES, IS_NATIVE } from '@/constants/routes'

// Vitrine publique (web)
import VitrineHome        from '@/pages/vitrine/VitrineHome'
import CreateursPage      from '@/pages/vitrine/CreateursPage'
import CreateurProfilPage from '@/pages/vitrine/CreateurProfilPage'
import SuiviVitrinePage   from '@/pages/vitrine/SuiviPage'
import { VitrineLayout }  from '@/pages/vitrine/vitrineCurrency'
import { QuiSommesNousPage, AidePage, ArtisansPage } from '@/pages/vitrine/VitrineInfoPages'
import FavorisPage         from '@/pages/vitrine/FavorisPage'
import InscriptionPage     from '@/pages/vitrine/InscriptionPage'
import PremiumPage         from '@/pages/vitrine/PremiumPage'

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
import SignalementsPage       from '@/pages/admin/SignalementsPage'
import BannierePage           from '@/pages/admin/BannierePage'

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
          <Route path="/admin/signalements"     element={<SignalementsPage />} />
          <Route path="/admin/banniere"         element={<BannierePage />} />
        </Route>

        {/* ── Vitrine publique (web uniquement) ───────────────────────── */}
        {!IS_NATIVE && (
          <Route element={<VitrineLayout />}>
            <Route path={ROUTES.VITRINE}           element={<VitrineHome />} />
            <Route path={ROUTES.VITRINE_CREATEURS} element={<CreateursPage />} />
            <Route path={ROUTES.VITRINE_CREATEUR}  element={<CreateurProfilPage />} />
            <Route path={ROUTES.VITRINE_SUIVI}     element={<SuiviVitrinePage />} />
            <Route path={ROUTES.VITRINE_ABOUT}     element={<QuiSommesNousPage />} />
            <Route path={ROUTES.VITRINE_AIDE}      element={<AidePage />} />
            <Route path={ROUTES.VITRINE_ARTISANS}  element={<ArtisansPage />} />
            <Route path={ROUTES.VITRINE_FAVORIS}   element={<FavorisPage />} />
            <Route path={ROUTES.VITRINE_INSCRIPTION} element={<InscriptionPage />} />
            <Route path="/premium"               element={<PremiumPage />} />
          </Route>
        )}

        {/* ── Routes publiques proprietaire ───────────────────────────── */}
        <Route path={ROUTES.LOGIN}           element={<LoginPage />}      />
        <Route path="/artisan-app"           element={<ArtisanAppPage />} />
        <Route path={ROUTES.REGISTER}        element={<RegisterPage />}   />
        <Route path={ROUTES.ONBOARDING}      element={<OnboardingPage />} />
        <Route path={ROUTES.OTP}             element={<OtpPage />}             />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />}  />
        <Route path={ROUTES.RECOVER_ACCOUNT} element={<RecoverAccountPage />}  />
        <Route path={ROUTES.LOGIN_SECRET_Q}  element={<LoginQuestionSecretePage />} />
        <Route path="/paiement/retour"       element={<PaiementRetourPage />} />

        {/* ── Routes protégées proprietaire ───────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.DASHBOARD}        element={<DashboardPage />}      />
          <Route path={ROUTES.MA_VITRINE}       element={<MaVitrinePage />}      />

          <Route path={ROUTES.CLIENTS}          element={<ClientsPage />}        />
          <Route path={ROUTES.CLIENT_DETAIL}    element={<ClientDetailPage />}   />

          <Route path={ROUTES.COMMANDE_NEW}     element={<NouvelleCommandePage />} />
          <Route path={ROUTES.COMMANDE_GROUPE_NEW}    element={<NouvelleCommandeGroupeePage />} />
          <Route path={ROUTES.COMMANDE_GROUPE_DETAIL} element={<CommandeGroupeDetailPage />}    />
          <Route path={ROUTES.COMMANDE_DETAIL}  element={<CommandeDetailPage />} />
          <Route path={ROUTES.COMMANDES}        element={<CommandesPage />}      />

          <Route path={ROUTES.VETEMENTS}        element={<AtelierPage />}         />
          <Route path="/catalogue/modeles"      element={<CataloguePage />}       />
          <Route path={ROUTES.ABONNEMENT}       element={<AbonnementRedirect />} />
          <Route path={ROUTES.POINTS}           element={<PointsPage />}         />
          <Route path={ROUTES.EQUIPE}           element={<EquipePage />}         />
          <Route path={ROUTES.NOTIFICATIONS}    element={<NotificationsPage />}  />
          <Route path={ROUTES.PARAMETRES}       element={<ParametresPage />}     />
          <Route path={ROUTES.PROFIL}           element={<ProfilPage />}          />
          <Route path={ROUTES.COMMUNICATIONS}   element={<CommunicationsPage />} />
          <Route path={ROUTES.THEME}            element={<ThemePage />}                       />
          <Route path={ROUTES.APROPOS}          element={<AProposPage />}         />
          <Route path={ROUTES.PHOTOS_VIP}       element={<GaleriePage />} />
          <Route path="/galerie"               element={<GaleriePage />} />
          <Route path={ROUTES.FACTURATION}      element={<FacturationPage />}     />
          <Route path={ROUTES.HISTORIQUE}       element={<HistoriquePage />}      />
          <Route path="/archives"               element={<ArchivesPage />}        />
          <Route path="/caisse"                 element={<CaissePage />}          />
          <Route path={ROUTES.FAQ}              element={<FAQPage />}             />
          <Route path={ROUTES.CONTACT}          element={<ContactPage />}         />
          <Route path={ROUTES.SUPPORT}          element={<SupportPage />}                     />
          <Route path={ROUTES.SUPPORT_TICKET}   element={<SupportTicketDetailPage />}         />
        </Route>

        <Route path="*" element={<Navigate to={IS_NATIVE ? ROUTES.DASHBOARD : ROUTES.VITRINE} replace />} />
      </Routes>
    </>
  )
}
