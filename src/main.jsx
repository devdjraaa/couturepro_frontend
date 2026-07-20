import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, AuthProvider, AtelierProvider, AdminAuthProvider, LangProvider } from '@/contexts'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'
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
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LangProvider>
          <ThemeProvider>
            <AdminAuthProvider>
              <AuthProvider>
                <AtelierProvider>
                  <App />
                  <PwaInstallBanner />
                  {/* Le composant n'avait JAMAIS été monté : les 40+ appels
                      `toast.success` / `toast.error` de l'application ne
                      produisaient rien. Aucune confirmation d'enregistrement,
                      aucun message d'erreur — l'utilisateur cliquait sans savoir
                      si son action avait abouti.
                      Les couleurs passent par les jetons de thème pour rester
                      lisibles en mode sombre. */}
                  <Toaster
                    position="top-center"
                    toastOptions={{
                      duration: 3500,
                      style: {
                        background: 'var(--color-card)',
                        color: 'var(--color-ink)',
                        border: '1px solid var(--color-edge)',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        maxWidth: '90vw',
                      },
                      error: { duration: 5000 },   // une erreur doit avoir le temps d'être lue
                    }}
                    containerStyle={{ top: 'max(1rem, env(safe-area-inset-top))' }}
                  />
                </AtelierProvider>
              </AuthProvider>
            </AdminAuthProvider>
          </ThemeProvider>
        </LangProvider>
      </BrowserRouter>
    </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
