import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DatabaseProvider } from '@nozbe/watermelondb/react'
import { Toaster } from 'react-hot-toast'
import database from '@/db/database'
import { ThemeProvider, AuthProvider, AtelierProvider, AdminAuthProvider, LangProvider, SyncProvider } from '@/contexts'
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

// OTA : confirme à Capgo que le bundle web démarre bien (sinon rollback auto).
import { notifyAppReady } from '@/utils/appUpdate'
notifyAppReady()

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
                      <Toaster
                        position="top-center"
                        containerStyle={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
                        toastOptions={{ duration: 3500 }}
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
  </StrictMode>,
)
