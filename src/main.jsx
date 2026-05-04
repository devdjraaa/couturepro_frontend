import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, AuthProvider, AtelierProvider, AdminAuthProvider, LangProvider, SyncProvider } from '@/contexts'
import './index.css'
import './lang/i18n.js'
import App from './App.jsx'

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
                  <SyncProvider>
                    <App />
                  </SyncProvider>
                </AtelierProvider>
              </AuthProvider>
            </AdminAuthProvider>
          </ThemeProvider>
        </LangProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
