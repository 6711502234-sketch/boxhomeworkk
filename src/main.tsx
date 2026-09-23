import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Global error guards to prevent browser crashing and freezing
window.addEventListener('unhandledrejection', (event) => {
  console.warn('[GlobalSafetyGuard] Prevented unhandled promise rejection crash:', event.reason);
  // Prevent default popup/crash
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.warn('[GlobalSafetyGuard] Prevented uncaught runtime error:', event.message);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
