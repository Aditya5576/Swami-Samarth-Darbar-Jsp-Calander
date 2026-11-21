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
      className="fixed bottom-20 left-3 right-3 md:left-auto md:right-4 md:bottom-6 md:max-w-md z-40 flex items-center justify-between gap-2.5 rounded-2xl bg-orange-950/95 px-3.5 py-2.5 text-xs text-amber-50 shadow-lg border border-amber-400/35 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2.5 min-w-0">
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
            className="min-h-[34px] px-2.5 py-1 rounded-xl bg-amber-300 hover:bg-amber-200 text-orange-950 font-black text-[11px] flex items-center gap-1 whitespace-nowrap transition"
          >
            <HardDrive className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'mr' ? 'वॉल्ट' : 'Vault'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissedKey(stateKey)}
          aria-label={t('close')}
          className="min-w-[32px] min-h-[32px] rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-amber-100 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
