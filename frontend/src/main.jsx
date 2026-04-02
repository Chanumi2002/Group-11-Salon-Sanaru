import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'
import { ThemeProvider } from './context/ThemeContext'

// Suppress console warnings during development
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    const message = args[0]?.toString?.() || '';
    // Suppress React Router v7 deprecation warnings
    if (message.includes('React Router') && message.includes('Future Flag')) return;
    if (message.includes('v7_startTransition') || message.includes('v7_relativeSplatPath')) return;
    // Suppress Sonner render warning
    if (message.includes('Cannot update a component')) return;
    originalWarn(...args);
  };
  
  console.error = (...args) => {
    const message = args[0]?.toString?.() || '';
    if (message.includes('Cannot update a component')) return;
    originalError(...args);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster />
    </ThemeProvider>
  </StrictMode>,
)
