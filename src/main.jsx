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

// #2 — Bouton Retour Android synchronisé avec React Router
import { App as CapApp } from '@capacitor/app'
CapApp.addListener('backButton', ({ canGoBack }) => {
  if (canGoBack) {
    window.history.back()
  } else {
    CapApp.exitApp()
  }
})

// OTA : confirme à Capgo que le bundle web démarre bien (sinon rollback auto).
import { notifyAppReady } from '@/utils/appUpdate'
notifyAppReady()

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
