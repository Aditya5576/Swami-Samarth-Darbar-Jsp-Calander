import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useLanguage } from '../context/LanguageContext';
import { WifiOff, Gauge, HardDrive, X } from 'lucide-react';

interface OfflineIndicatorProps {
  onOpenOfflineVault?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onOpenOfflineVault }) => {
  const network = useNetworkStatus();
  const { language, t } = useLanguage();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  const stateKey = !network.isOnline
    ? 'offline'
    : network.isSlowConnection && network.isDataSaverActive
    ? 'slow'
    : null;

  useEffect(() => {
    if (!stateKey) {
      setDismissedKey(null);
    }
  }, [stateKey]);

  if (!stateKey || dismissedKey === stateKey) return null;

  const isOffline = stateKey === 'offline';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-[calc(var(--app-bottom-nav-height,4.5rem)+0.5rem)] left-[max(0.75rem,env(safe-area-inset-left))] right-[max(0.75rem,env(safe-area-inset-right))] md:left-auto md:right-[max(1rem,env(safe-area-inset-right))] md:max-w-md z-40 flex items-center justify-between gap-2 rounded-2xl bg-orange-950/95 px-3 py-2 text-xs text-amber-50 shadow-lg border border-amber-400/35 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {isOffline ? (
          <WifiOff className="w-4 h-4 shrink-0 text-amber-300" />
        ) : (
          <Gauge className="w-4 h-4 shrink-0 text-amber-300" />
        )}
        <div className="min-w-0">
          <p className="font-bold text-white leading-tight truncate">
            {isOffline
              ? t('offlineTitle')
              : language === 'mr'
              ? `2G/3G डेटा सेव्हर सक्रिय (${network.effectiveType.toUpperCase()})`
              : `2G/3G Data-Saver Active (${network.effectiveType.toUpperCase()})`}
          </p>
          <p className="text-[11px] text-amber-200/90 leading-snug truncate">
            {isOffline
              ? t('offlineDesc')
              : language === 'mr'
              ? 'सेवा वेगात सुरू आहे · YouTube टॅपवर लोड होईल'
              : 'Fast Seva mode · YouTube loads only on tap'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {onOpenOfflineVault && (
          <button
            type="button"
            onClick={onOpenOfflineVault}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-orange-950 font-black text-[11px] flex items-center gap-1 whitespace-nowrap transition"
          >
            <HardDrive className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'mr' ? 'वॉल्ट' : 'Vault'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissedKey(stateKey)}
          aria-label={t('close')}
          className="min-w-[44px] min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-amber-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
