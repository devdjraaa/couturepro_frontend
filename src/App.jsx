import { useEffect } from 'react'
import AnalytiquePage from '@/pages/admin/AnalytiquePage'
import AnnoncesPage from '@/pages/AnnoncesPage'
import ReglagesVitrinePage from '@/pages/admin/ReglagesVitrinePage'
import SplashDemarrage from '@/components/layout/SplashDemarrage'
import CompteReboursLancement from '@/components/vitrine/CompteReboursLancement'
import { Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from '@/components/ScrollToTop'
import { ProtectedRoute, DesignerRoute } from '@/components/layout'
import { AdminProtectedRoute } from '@/components/admin'
import {
  LoginPage, RegisterPage, OnboardingPage,
  DashboardPage,
  ClientsPage, ClientDetailPage,
  CommandesPage, CommandeDetailPage, NouvelleCommandePage,
  NouvelleCommandeGroupeePage, CommandeGroupeDetailPage,
  AtelierPage, CataloguePage, EquipePage, PointsPage,
  NotificationsPage, InfosPage, ParametresPage, CommunicationsPage,
  SupportPage, SupportTicketDetailPage, ThemePage,
} from '@/pages'
import PaiementRetourPage     from '@/pages/PaiementRetourPage'
import OtpPage                  from '@/pages/auth/OtpPage'
import SocialCallbackPage       from '@/pages/auth/SocialCallbackPage'
import ForgotPasswordPage       from '@/pages/auth/ForgotPasswordPage'
import RecoverAccountPage       from '@/pages/auth/RecoverAccountPage'
import LoginQuestionSecretePage from '@/pages/auth/LoginQuestionSecretePage'
import ArtisanAppPage           from '@/pages/auth/ArtisanAppPage'
import BienvenuePage            from '@/pages/auth/BienvenuePage'
import ProfilPage             from '@/pages/ProfilPage'
import MaVitrinePage          from '@/pages/MaVitrinePage'
import AProposPage            from '@/pages/AProposPage'
import FAQPage                from '@/pages/FAQPage'
import ContactPage            from '@/pages/ContactPage'
import FacturationPage        from '@/pages/FacturationPage'
import OutilsCreatifsPage     from '@/pages/OutilsCreatifsPage'
import StudioPage             from '@/pages/StudioPage'
import HistoriquePage         from '@/pages/HistoriquePage'
import QuoiDeNeufPage        from '@/pages/QuoiDeNeufPage'
import ArchivesPage           from '@/pages/ArchivesPage'
import CaissePage             from '@/pages/CaissePage'
import GaleriePage            from '@/pages/GaleriePage'
import MesRealisationsPage     from '@/pages/MesRealisationsPage'
import { FeatureGate } from '@/components/abonnement'
import { AppLayout } from '@/components/layout'
import { ROUTES, IS_NATIVE } from '@/constants/routes'

// Vitrine publique (web)
import VitrineHome        from '@/pages/vitrine/VitrineHome'
import VasatPage          from '@/pages/vitrine/VasatPage'
import PartenairesPage    from '@/pages/vitrine/PartenairesPage'
import CreateursPage      from '@/pages/vitrine/CreateursPage'
import CreateurProfilPage from '@/pages/vitrine/CreateurProfilPage'
import SuiviVitrinePage   from '@/pages/vitrine/SuiviPage'
import { VitrineLayout }  from '@/pages/vitrine/vitrineCurrency'
import { QuiSommesNousPage, AidePage, ArtisansPage } from '@/pages/vitrine/VitrineInfoPages'
import FavorisPage         from '@/pages/vitrine/FavorisPage'
import InscriptionPage     from '@/pages/vitrine/InscriptionPage'
import PremiumPage           from '@/pages/vitrine/PremiumPage'
import SponsorisationPage    from '@/pages/vitrine/SponsorisationPage'
import Vitrine404Page        from '@/pages/vitrine/Vitrine404Page'
import {
  ConfidentialitePage,
  MentionsLegalesPage,
  CookiesPage,
  ProtectionDonneesPage,
  CguPage,
  DroitsCreateursPage,
  ConditionsVentePage,
  ProduitsInterditesPage,
  LivraisonRetoursPage,
  ReglesCommunautePage,
  ContactReclamationsPage,
} from '@/pages/vitrine/VitrineLegalPages'
import PatronRecuPage         from '@/pages/vitrine/PatronRecuPage'
import PatronRecupererPage    from '@/pages/vitrine/PatronRecupererPage'
import EspaceClientPage       from '@/pages/vitrine/EspaceClientPage'

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
import VeillePage              from '@/pages/admin/VeillePage'
import PagesLegalesPage        from '@/pages/admin/PagesLegalesPage'
import CodesPromoPage          from '@/pages/admin/CodesPromoPage'
import ListeNoirePage          from '@/pages/admin/ListeNoirePage'
import AuditPage               from '@/pages/admin/AuditPage'
import AdminNotificationsPage  from '@/pages/admin/AdminNotificationsPage'
import AdminInfosPage         from '@/pages/admin/AdminInfosPage'
import DiagnosticPage           from '@/pages/admin/DiagnosticPage'
import AdminParametresPage    from '@/pages/admin/AdminParametresPage'
import AdminsPage             from '@/pages/admin/AdminsPage'
import SignalementsPage       from '@/pages/admin/SignalementsPage'
import AdminRealisationsPage   from '@/pages/admin/AdminRealisationsPage'
import BannierePage           from '@/pages/admin/BannierePage'

const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-full p-8 text-dim">
    {title} — page à implémenter
  </div>
)

// Redirections vers ParametresPage pour l'abonnement
const AbonnementRedirect = () => <Navigate to={`${ROUTES.PARAMETRES}?tab=abonnement`} replace />

export default function App() {
  // App « Gextimo Admin » (com.couturepro.admin) : ouvre directement l'espace admin au lancement.
  // L'app « Gextimo » (com.gextimo.app) garde l'entrée pros par défaut. Détection à l'exécution
  // via l'appId (un seul bundle partagé par les deux applications Android).
  useEffect(() => {
    if (!IS_NATIVE) return
    let cancelled = false
    import('@capacitor/app')
      .then(({ App: CapApp }) => CapApp.getInfo())
      .then((info) => {
        if (!cancelled && info?.id === 'com.couturepro.admin' && window.location.pathname === '/') {
          window.location.replace('/admin/login')
        }
      })
      .catch(() => { /* plugin indisponible : on reste sur l'entrée par défaut */ })
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <ScrollToTop />
      {/* SUG-1 — ouverture « favicon → logo → connexion ». Monté à la RACINE :
          dans AppLayout il se remonterait à chaque navigation. Une fois par
          session, passable, et rien du tout si l'utilisateur a demandé moins
          d'animations. Porte aussi l'habillage saisonnier (brief 16/07 pt 6),
          dont le socle serveur n'était appelé par aucun écran. */}
      {!window.location.pathname.startsWith('/admin') && <SplashDemarrage />}

      {/* CLI-3 — compte à rebours de lancement. Monté ici pour la même raison
          que l'ouverture : la bande doit coiffer toutes les pages publiques, et
          le rejet ne doit pas être perdu à chaque navigation. Hors admin : la
          direction n'a pas à recevoir sa propre annonce. */}
      {!window.location.pathname.startsWith('/admin') && <CompteReboursLancement />}

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
          <Route path="/admin/veille"           element={<VeillePage />} />
          <Route path="/admin/pages"            element={<PagesLegalesPage />} />
          <Route path="/admin/codes-promo"      element={<CodesPromoPage />} />
          <Route path="/admin/liste-noire"      element={<ListeNoirePage />} />
          <Route path="/admin/audit"            element={<AuditPage />} />
          <Route path="/admin/notifications"    element={<AdminNotificationsPage />} />
          <Route path="/admin/infos"            element={<AdminInfosPage />} />
          <Route path="/admin/diagnostic"       element={<DiagnosticPage />} />{/* P110-111 */}
          <Route path="/admin/parametres"       element={<AdminParametresPage />} />
          <Route path="/admin/admins"           element={<AdminsPage />} />
          <Route path="/admin/signalements"     element={<SignalementsPage />} />
          <Route path="/admin/realisations"     element={<AdminRealisationsPage />} />
          <Route path="/admin/banniere"         element={<BannierePage />} />
          <Route path="/admin/reglages-vitrine" element={<ReglagesVitrinePage />} />
          <Route path="/admin/analytique"       element={<AnalytiquePage />} />
        </Route>

        {/* ── Vitrine publique (web uniquement) ───────────────────────── */}
        {!IS_NATIVE && (
          <Route element={<VitrineLayout />}>
            <Route path={ROUTES.VITRINE}           element={<VitrineHome />} />
            {/* VASAT : second produit du groupe, masqué par mot de passe (20/07). */}
            <Route path="/vasat"                   element={<VasatPage />} />
            <Route path={ROUTES.VITRINE_CREATEURS} element={<CreateursPage />} />
            <Route path={ROUTES.VITRINE_CREATEUR}  element={<CreateurProfilPage />} />
            <Route path={ROUTES.VITRINE_SUIVI}     element={<SuiviVitrinePage />} />
            <Route path={ROUTES.VITRINE_ABOUT}     element={<QuiSommesNousPage />} />
            <Route path={ROUTES.VITRINE_AIDE}      element={<AidePage />} />
            <Route path={ROUTES.VITRINE_ARTISANS}  element={<ArtisansPage />} />
            <Route path={ROUTES.VITRINE_PARTENAIRES} element={<PartenairesPage />} />
            <Route path={ROUTES.VITRINE_FAVORIS}   element={<FavorisPage />} />
            <Route path={ROUTES.VITRINE_INSCRIPTION} element={<InscriptionPage />} />
            <Route path="/premium"               element={<PremiumPage />} />
            <Route path={ROUTES.VITRINE_SPONSORISATION} element={<SponsorisationPage />} />
            <Route path={ROUTES.VITRINE_CONFIDENTIALITE}    element={<ConfidentialitePage />} />
            <Route path={ROUTES.VITRINE_MENTIONS}           element={<MentionsLegalesPage />} />
            <Route path={ROUTES.VITRINE_COOKIES}            element={<CookiesPage />} />
            <Route path={ROUTES.VITRINE_PROTECTION_DONNEES} element={<ProtectionDonneesPage />} />
            <Route path={ROUTES.VITRINE_CGU}                element={<CguPage />} />
            <Route path={ROUTES.VITRINE_DROITS_CREATEURS}   element={<DroitsCreateursPage />} />
            <Route path={ROUTES.VITRINE_CONDITIONS_VENTE}   element={<ConditionsVentePage />} />
            <Route path={ROUTES.VITRINE_PRODUITS_INTERDITS} element={<ProduitsInterditesPage />} />
            <Route path={ROUTES.VITRINE_LIVRAISON_RETOURS}  element={<LivraisonRetoursPage />} />
            <Route path={ROUTES.VITRINE_REGLES_COMMUNAUTE}  element={<ReglesCommunautePage />} />
            <Route path={ROUTES.VITRINE_CONTACT_RECLAMATIONS} element={<ContactReclamationsPage />} />
            {/* P161-163 : patrons payants — reçu (après paiement) + menu récupération. */}
            <Route path="/patrons/recu/:code" element={<PatronRecuPage />} />
            <Route path="/patrons/recuperer"  element={<PatronRecupererPage />} />
            {/* P202 : espace client (connexion sans mot de passe, commandes, avis, réclamations). */}
            <Route path={ROUTES.VITRINE_ESPACE_CLIENT} element={<EspaceClientPage />} />
            <Route path="*" element={<Vitrine404Page />} />
          </Route>
        )}

        {/* ── Routes publiques proprietaire ───────────────────────────── */}
        <Route path={ROUTES.LOGIN}           element={<LoginPage />}      />
        <Route path="/artisan-app"           element={<ArtisanAppPage />} />
        {/* Web : l'inscription se fait dans l'app mobile → /register renvoie vers la page
            « Télécharger l'app ». Seule la connexion reste dispo sur le web. En natif,
            le vrai formulaire d'inscription s'affiche. */}
        <Route
          path={ROUTES.REGISTER}
          element={IS_NATIVE ? <RegisterPage /> : <Navigate to={ROUTES.VITRINE_INSCRIPTION} replace />}
        />
        <Route path={ROUTES.ONBOARDING}      element={<OnboardingPage />} />
        <Route path={ROUTES.BIENVENUE}       element={<BienvenuePage />} />
        <Route path={ROUTES.OTP}             element={<OtpPage />}             />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />}  />
        <Route path={ROUTES.RECOVER_ACCOUNT} element={<RecoverAccountPage />}  />
        <Route path={ROUTES.LOGIN_SECRET_Q}  element={<LoginQuestionSecretePage />} />
        <Route path="/auth/social/callback"  element={<SocialCallbackPage />} />{/* P150 */}
        <Route path="/paiement/retour"       element={<PaiementRetourPage />} />

        {/* ── Routes protégées proprietaire ───────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.DASHBOARD}        element={<DashboardPage />}      />

          {/* Réservé aux comptes designer (storefront vitrine + outils créatifs) */}
          <Route element={<DesignerRoute />}>
            <Route path={ROUTES.MA_VITRINE}       element={<MaVitrinePage />}       />
            <Route path={ROUTES.OUTILS_CREATIFS}  element={<OutilsCreatifsPage />}  />
            <Route path={ROUTES.STUDIO}           element={<StudioPage />}          />
          </Route>

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
          <Route path={ROUTES.INFOS}            element={<InfosPage />}          />
          <Route path={ROUTES.PARAMETRES}       element={<ParametresPage />}     />
          <Route path={ROUTES.PROFIL}           element={<ProfilPage />}          />
          <Route path={ROUTES.COMMUNICATIONS}   element={<CommunicationsPage />} />
          <Route path={ROUTES.THEME}            element={<ThemePage />}                       />
          <Route path={ROUTES.APROPOS}          element={<AProposPage />}         />
          <Route path={ROUTES.PHOTOS_VIP}       element={<GaleriePage />} />
          <Route path="/galerie"               element={<GaleriePage />} />
          <Route path="/annonces"               element={<AnnoncesPage />}       />
          <Route path={ROUTES.REALISATIONS}     element={<MesRealisationsPage />} />
          <Route path={ROUTES.FACTURATION}      element={<FacturationPage />}     />
          <Route path={ROUTES.HISTORIQUE}       element={<HistoriquePage />}      />
          <Route path={ROUTES.QUOI_DE_NEUF}     element={<QuoiDeNeufPage />}      />
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
