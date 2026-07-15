import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, AuthProvider, AtelierProvider, AdminAuthProvider, LangProvider } from '@/contexts'
import './index.css'
import './lang/i18n.js'
import App from './App.jsx'

// #2 — Bouton Retour Android synchronisé avec React Router
import { App as CapApp } from '@capacitor/app'
CapApp.addListener('backButton', ({ canGoBack }) => {
  if (canGoBack) {
    window.history.back()
  } else {
    CapApp.exitApp()
  }
})

// PWA (P186) — bannière d'installation + service worker (web).
import { registerPwa } from '@/utils/pwa'
import PwaInstallBanner from '@/components/ui/PwaInstallBanner'
registerPwa()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LangProvider>
          <ThemeProvider>
            <AdminAuthProvider>
              <AuthProvider>
                <AtelierProvider>
                  <App />
                  <PwaInstallBanner />
                </AtelierProvider>
              </AuthProvider>
            </AdminAuthProvider>
          </ThemeProvider>
        </LangProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
