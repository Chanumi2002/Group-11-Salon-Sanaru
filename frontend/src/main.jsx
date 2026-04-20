import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'
import { ThemeProvider } from './context/ThemeContext'
import axios from 'axios'

// Global Axios interceptor to silently handle expected 404s
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silently resolve 404s for holiday-overrides (no override found is normal/expected)
    if (
      error.response?.status === 404 &&
      error.config?.url?.includes('api/holiday-overrides/by-date')
    ) {
      // Prevent axios from logging this error
      error.silence = true;
      return Promise.resolve({ status: 404, data: null });
    }
    return Promise.reject(error);
  }
);

// Add request interceptor to mark holiday-override requests
axios.interceptors.request.use((config) => {
  if (config.url?.includes('api/holiday-overrides/by-date')) {
    config._suppressLogging = true;
  }
  return config;
});



// Global error handler to suppress holiday-override 404s
window.addEventListener('error', (event) => {
  const errorMessage = event.message?.toLowerCase?.() || '';
  const errorUrl = event.filename?.toLowerCase?.() || '';
  if (errorMessage.includes('holiday-overrides') || errorUrl.includes('holiday-overrides')) {
    event.preventDefault();
  }
});

// Suppress unhandled promise rejections for holiday-overrides
window.addEventListener('unhandledrejection', (event) => {
  const errorText = event.reason?.toString?.().toLowerCase?.() || '';
  const urlText = event.reason?.config?.url?.toLowerCase?.() || '';
  if (errorText.includes('holiday-overrides') || urlText.includes('holiday-overrides')) {
    event.preventDefault();
  }
});

// Suppress console logging for these requests
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;
  const originalInfo = console.info;
  
  // Helper function to check if any argument mentions holiday-overrides 404
  const shouldSuppressHolidayOverride = (...args) => {
    // Join ALL args to check combined context
    const combinedText = args.map(a => a?.toString?.() || '').join(' ').toLowerCase();
    
    // Check if combined text has holiday-overrides endpoint
    if (combinedText.includes('holiday-overrides') || combinedText.includes('api/holiday-overrides/by-date')) {
      return true;
    }
    
    // Also check individual args for axios error objects
    for (const arg of args) {
      if (arg?.config?.url?.includes('holiday-overrides') && arg?.response?.status === 404) {
        return true;
      }
    }
    return false;
  };
  
  console.warn = (...args) => {
    if (shouldSuppressHolidayOverride(...args)) return;
    const message = args[0]?.toString?.() || '';
    // Suppress React Router v7 deprecation warnings
    if (message.includes('React Router') && message.includes('Future Flag')) return;
    if (message.includes('v7_startTransition') || message.includes('v7_relativeSplatPath')) return;
    // Suppress Sonner render warning
    if (message.includes('Cannot update a component')) return;
    // Suppress Google Sign-In multiple initialization warning
    if (message.includes('google.accounts.id.initialize()')) return;
    // Suppress browser Tracking Prevention warnings about storage access (Firefox privacy protection)
    if (message.includes('Tracking Prevention') || message.includes('blocked access to storage') || message.includes('credential_button_library')) return;
    // Suppress Cross-Origin-Opener-Policy postMessage warnings
    if (message.includes('Cross-Origin-Opener-Policy') && message.includes('postMessage')) return;
    originalWarn(...args);
  };
  
  console.error = (...args) => {
    if (shouldSuppressHolidayOverride(...args)) return;
    
    // Join all arguments to check full context
    const fullText = args.map(a => a?.toString?.() || '').join(' ').toLowerCase();
    
    // Suppress Tracking Prevention errors (Firefox privacy feature)
    if (fullText.includes('tracking prevention') || fullText.includes('blocked access to storage') || fullText.includes('credential_button_library')) {
      return;
    }
    
    // Suppress ANY error mention of holiday-overrides (4xx status codes are expected)
    if (fullText.includes('holiday-overrides') || fullText.includes('/api/holiday-overrides')) {
      return;
    }
    
    // Suppress GET requests with 404 status that include the full URL
    if (fullText.includes('get http://localhost:8080') && fullText.includes('404')) {
      return;
    }
    
    // Suppress "404 (Not Found)" errors
    if (fullText.includes('404') && fullText.includes('not found')) {
      // But check if it's for the endpoint we care about
      if (fullText.includes('holiday') || fullText.includes('overrides')) {
        return;
      }
    }
    
    const message = args[0]?.toString?.() || '';
    if (message.includes('Cannot update a component')) return;
    originalError(...args);
  };

  console.log = (...args) => {
    if (shouldSuppressHolidayOverride(...args)) return;
    originalLog(...args);
  };
  
  console.info = (...args) => {
    if (shouldSuppressHolidayOverride(...args)) return;
    originalInfo(...args);
  };
}

// Suppress non-critical intervention messages (like lazy loading image reports)
if (window.ReportingObserver) {
  try {
    const observer = new ReportingObserver((reports) => {
      for (const report of reports) {
        // Suppress "Images loaded lazily" intervention messages
        if (report.body?.message?.includes('loaded lazily')) {
          continue;
        }
      }
    }, { types: ['intervention'], buffered: true });
    observer.observe();
  } catch (e) {
    // ReportingObserver not fully supported, silently ignore
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster />
    </ThemeProvider>
  </StrictMode>,
)
