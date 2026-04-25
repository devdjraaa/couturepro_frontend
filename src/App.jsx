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

export default function App() {
  return (
    <>
      <SyncIndicator />
      <Routes>
        {/* Routes publiques */}
        <Route path="/login"       element={<LoginPage />}      />
        <Route path="/register"    element={<RegisterPage />}   />
        <Route path="/onboarding"  element={<OnboardingPage />} />

        {/* Routes protégées */}
        <Route element={<ProtectedRoute />}>
          <Route path="/"                element={<DashboardPage />}      />
          <Route path="/clients"         element={<ClientsPage />}        />
          <Route path="/clients/:id"     element={<ClientDetailPage />}   />
          <Route path="/commandes/new"   element={<CommandesPage />}      />
          <Route path="/commandes/:id"   element={<CommandeDetailPage />} />
          <Route path="/commandes"       element={<CommandesPage />}      />
          <Route path="/catalogue"       element={<CataloguePage />}      />
          <Route path="/equipe"          element={<EquipePage />}         />
          <Route path="/points"          element={<PointsPage />}         />
          <Route path="/notifications"   element={<NotificationsPage />}  />
          <Route path="/parametres"      element={<ParametresPage />}     />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
