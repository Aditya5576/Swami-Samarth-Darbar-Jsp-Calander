import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppErrorBoundary } from './components/AppErrorBoundary.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Automatically register the service worker for full offline PWA caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('swami-sw-update-available'));
  },
  onOfflineReady() {
    (window as unknown as { __SWAMI_SW_OFFLINE_READY__?: boolean }).__SWAMI_SW_OFFLINE_READY__ = true;
    window.dispatchEvent(new CustomEvent('swami-sw-offline-ready'));
  },
});

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
