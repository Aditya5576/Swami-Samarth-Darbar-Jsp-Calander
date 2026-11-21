import { useEffect, useState, useCallback } from 'react';

export type DataSaverPreference = 'auto' | 'always' | 'off';
export type ConnectionEffectiveType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';

interface NetworkInformationLike extends EventTarget {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
}

const DATA_SAVER_STORAGE_KEY = 'swami_data_saver_preference_v1';
const DATA_SAVER_EVENT = 'swami-data-saver-preference-changed';

function getNavigatorConnection(): NetworkInformationLike | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as unknown as {
    connection?: NetworkInformationLike;
    mozConnection?: NetworkInformationLike;
    webkitConnection?: NetworkInformationLike;
  };
  return nav.connection || nav.mozConnection || nav.webkitConnection || null;
}

function readConnectionSnapshot(): {
  effectiveType: ConnectionEffectiveType;
  browserSaveData: boolean;
  downlinkMbps: number | null;
} {
  const conn = getNavigatorConnection();
  if (!conn) {
    return { effectiveType: 'unknown', browserSaveData: false, downlinkMbps: null };
  }
  const rawType = conn.effectiveType;
  const effectiveType: ConnectionEffectiveType =
    rawType === 'slow-2g' || rawType === '2g' || rawType === '3g' || rawType === '4g'
      ? rawType
      : 'unknown';
  return {
    effectiveType,
    browserSaveData: Boolean(conn.saveData),
    downlinkMbps: typeof conn.downlink === 'number' ? conn.downlink : null,
  };
}

export function getStoredDataSaverPreference(): DataSaverPreference {
  try {
    const val = localStorage.getItem(DATA_SAVER_STORAGE_KEY);
    if (val === 'auto' || val === 'always' || val === 'off') {
      return val;
    }
  } catch {
    // ignore storage errors
  }
  return 'auto';
}

export function setStoredDataSaverPreference(pref: DataSaverPreference): void {
  try {
    localStorage.setItem(DATA_SAVER_STORAGE_KEY, pref);
  } catch {
    // ignore storage errors
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_SAVER_EVENT, { detail: pref }));
  }
}

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType: ConnectionEffectiveType;
  browserSaveData: boolean;
  downlinkMbps: number | null;
  isSlowConnection: boolean;
  dataSaverPreference: DataSaverPreference;
  isDataSaverActive: boolean;
  setDataSaverPreference: (pref: DataSaverPreference) => void;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [connInfo, setConnInfo] = useState(readConnectionSnapshot);
  const [dataSaverPreference, setPrefState] = useState<DataSaverPreference>(
    getStoredDataSaverPreference
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnInfo(readConnectionSnapshot());
    };
    const handleOffline = () => setIsOnline(false);
    const handleConnectionChange = () => setConnInfo(readConnectionSnapshot());
    const handlePrefChanged = () => setPrefState(getStoredDataSaverPreference());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(DATA_SAVER_EVENT, handlePrefChanged);

    const conn = getNavigatorConnection();
    if (conn) {
      conn.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(DATA_SAVER_EVENT, handlePrefChanged);
      if (conn) {
        conn.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  const setDataSaverPreference = useCallback((pref: DataSaverPreference) => {
    setStoredDataSaverPreference(pref);
    setPrefState(pref);
  }, []);

  const isSlowConnection =
    connInfo.browserSaveData ||
    connInfo.effectiveType === 'slow-2g' ||
    connInfo.effectiveType === '2g' ||
    connInfo.effectiveType === '3g' ||
    (connInfo.downlinkMbps !== null && connInfo.downlinkMbps > 0 && connInfo.downlinkMbps <= 1.2);

  const isDataSaverActive =
    dataSaverPreference === 'always' ||
    (dataSaverPreference === 'auto' && isSlowConnection);

  return {
    isOnline,
    effectiveType: connInfo.effectiveType,
    browserSaveData: connInfo.browserSaveData,
    downlinkMbps: connInfo.downlinkMbps,
    isSlowConnection,
    dataSaverPreference,
    isDataSaverActive,
    setDataSaverPreference,
  };
}
