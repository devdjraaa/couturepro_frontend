import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DatabaseProvider } from '@nozbe/watermelondb/react'
import { Toaster } from 'react-hot-toast'
import database from '@/db/database'
import { ThemeProvider, AuthProvider, AtelierProvider, AdminAuthProvider, LangProvider, SyncProvider } from '@/contexts'
import ErrorBoundary from '@/components/ErrorBoundary'
import './index.css'
import './lang/i18n.js'
import App from './App.jsx'

// #2 / P4 — Bouton Retour Android : ferme d'abord l'overlay ouvert (= « Annuler »),
// sinon navigue en arrière (React Router), sinon quitte l'app.
import { App as CapApp } from '@capacitor/app'
import { runTopBackHandler } from '@/utils/backHandler'
CapApp.addListener('backButton', ({ canGoBack }) => {
  if (runTopBackHandler()) return   // une modale/feuille était ouverte → on la ferme
  if (canGoBack) {
    window.history.back()
  } else {
    CapApp.exitApp()
  }
})

// OTA : la confirmation du bundle part d'App.jsx, une fois l'arbre monté et
// tenu quelques secondes — la confirmer ici reviendrait à déclarer sain tout
// bundle qui se parse, même s'il plante à l'écran juste après.

// PWA (P186) — web uniquement (inerte en natif : ne doit jamais toucher l'OTA Capgo).
import { registerPwa } from '@/utils/pwa'
import PwaInstallBanner from '@/components/ui/PwaInstallBanner'
registerPwa()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
    <DatabaseProvider database={database}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LangProvider>
            <ThemeProvider>
              <AdminAuthProvider>
                <AuthProvider>
                  <AtelierProvider>
                    <SyncProvider>
                      <App />
                      <PwaInstallBanner />
                      {/* Le repli `0px` de `env()` est VOULU : sur un appareil
                          sans encoche déclarée, `max(1rem, env(...))` peut
                          rendre une valeur vide et coller le message au bord.
                          Les couleurs viennent des jetons de thème — sans elles
                          un message restait blanc sur blanc en mode sombre —
                          et une erreur a plus de temps pour être lue. */}
                      <Toaster
                        position="top-center"
                        containerStyle={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
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
                          error: { duration: 5000 },
                        }}
                      />
                    </SyncProvider>
                  </AtelierProvider>
                </AuthProvider>
              </AdminAuthProvider>
            </ThemeProvider>
          </LangProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </DatabaseProvider>
    </ErrorBoundary>
  </StrictMode>,
)
