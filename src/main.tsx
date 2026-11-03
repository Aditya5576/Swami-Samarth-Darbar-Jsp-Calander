import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Automatically register the service worker for full offline PWA caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    // Service worker updated
  },
  onOfflineReady() {
    // App is ready to work offline
  },
});

createRoot(document.getElementById('root')!).render(<App />);
