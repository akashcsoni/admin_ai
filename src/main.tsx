import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { ServiceCreditsProvider } from './context/ServiceCreditsContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ServiceCreditsProvider>
        <App />
      </ServiceCreditsProvider>
    </AuthProvider>
  </StrictMode>,
)
