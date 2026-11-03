import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useLanguage } from '../context/LanguageContext';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-6 z-50 flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-xs sm:text-sm font-medium text-white shadow-xl shadow-orange-950/20 border border-amber-300/30 animate-pulse backdrop-blur-sm"
    >
      <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
      <div>
        <p className="font-bold">{t('offlineTitle')}</p>
        <p className="text-[11px] text-amber-100">{t('offlineDesc')}</p>
      </div>
    </div>
  );
};
