import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster, toast } from 'react-hot-toast'
import App from './App.jsx'
import './styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
              fontWeight: '600',
              fontSize: '15px',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
              border: '2px solid #059669',
              cursor: 'pointer',
              minWidth: '300px'
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981'
            }
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
              fontWeight: '600',
              fontSize: '15px',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
              border: '2px solid #dc2626',
              cursor: 'pointer',
              minWidth: '300px'
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444'
            }
          },
          loading: {
            style: {
              background: '#3b82f6',
              color: '#fff',
              fontWeight: '600',
              fontSize: '15px',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
              border: '2px solid #2563eb',
              minWidth: '300px'
            }
          }
        }}
      >
        {(t) => (
          <div
            onClick={() => toast.dismiss(t.id)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {t.message}
          </div>
        )}
      </Toaster>
    </QueryClientProvider>
  </React.StrictMode>
)
