import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster, toast } from 'react-hot-toast'
import { PostHogProvider } from 'posthog-js/react'
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

// PostHog configuration
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const isDisabled = localStorage.getItem('disable_analytics') === 'true'

const posthogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  person_profiles: 'identified_only', // Only create profiles for identified users
  capture_pageview: true, // Automatically capture pageviews
  capture_pageleave: true, // Track when users leave pages
  // Disable tracking on localhost by default (can be overridden with localStorage)
  opt_out_capturing_by_default: isLocalhost || isDisabled,
  loaded: (posthog) => {
    // Only enable debug mode in development
    if (import.meta.env.DEV) {
      posthog.debug()
      console.log('📊 PostHog Analytics:', isLocalhost || isDisabled ? '⏸️  DISABLED (localhost)' : '✅ ENABLED')
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={posthogOptions}
    >
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            className: '',
            style: {
              maxWidth: '500px',
            },
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
                minWidth: '300px'
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981'
              },
              duration: 4000
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
                minWidth: '300px'
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444'
              },
              duration: 4000
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
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#3b82f6'
              }
            }
          }}
        />
      </QueryClientProvider>
    </PostHogProvider>
  </React.StrictMode>
)
