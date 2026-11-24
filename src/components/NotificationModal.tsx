import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { getTodayDateInfo } from '../utils/calendarLogic';
import {
  getNotificationSettings,
  saveNotificationSettings,
  sendDailyNotification,
  requestNotificationPermission,
  isNotificationSupported,
  buildTodayNotificationMessage,
  type NotificationSettings,
  type NotificationCapabilities,
  getNotificationCapabilities,
  getCustomTimerState,
  saveCustomTimerState,
  sendTimerAlertNotification,
  type CustomTimerState,
  scheduleFutureDailyAlarms,
  testBackgroundNotification,
  registerPeriodicDailySync,
  unregisterPeriodicDailySync,
} from '../utils/notificationService';
import {
  Bell,
  CheckCircle,
  X,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  AlertCircle,
  Timer,
  Play,
  Square,
  Flame,
  Zap,
  Smartphone,
  CalendarCheck,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const [modalTab, setModalTab] = useState<'daily' | 'timer'>('daily');
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState<string | null>(null);
  const [bgTestCountdown, setBgTestCountdown] = useState<number | null>(null);
  const [showBatteryHelp, setShowBatteryHelp] = useState(false);
  const [capabilities, setCapabilities] = useState<NotificationCapabilities | null>(null);

  const dialogRef = useDialogA11y(isOpen, onClose);

  // Custom Timer States
  const [timerState, setTimerState] = useState<CustomTimerState | null>(getCustomTimerState());
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);
  const [customInputMinutes, setCustomInputMinutes] = useState<string>('');
  const [timerPurpose, setTimerPurpose] = useState<string>('japa');
  const [timerSuccessMsg, setTimerSuccessMsg] = useState<string | null>(null);

  const todayInfo = getTodayDateInfo();
  const todayMessage = buildTodayNotificationMessage(todayInfo.dayData, language);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
    const current = getCustomTimerState();
    setTimerState(current);
    void getNotificationCapabilities().then(setCapabilities);
  }, [isOpen]);

  // Live countdown ticker for custom timer
  useEffect(() => {
    if (!timerState || !timerState.active) {
      setRemainingSeconds(0);
      return;
    }

    const updateCountdown = () => {
      const diffMs = timerState.targetTimestamp - Date.now();
      const secs = Math.max(0, Math.ceil(diffMs / 1000));
      setRemainingSeconds(secs);

      if (secs <= 0) {
        const purposeLabel = getPurposeLabel(timerState.purpose);
        sendTimerAlertNotification(purposeLabel, language, timerState.soundEnabled);
        saveCustomTimerState(null);
        setTimerState(null);
        setTimerSuccessMsg(
          language === 'mr'
            ? '॥ श्री स्वामी समर्थ ॥ टायमर वेळ पूर्ण झाली आहे!'
            : '॥ Shree Swami Samarth ॥ Timer completed!'
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [timerState, language]);

  if (!isOpen) return null;

  const handleToggleEnable = async () => {
    if (!settings.enabled) {
      if (isNotificationSupported()) {
        const res = await requestNotificationPermission(language);
        setPermission(res);
        if (res === 'denied') {
          setErrorMessage(
            language === 'mr'
              ? 'ब्राऊझरमध्ये नोटिफिकेशन परवानगी ब्लॉक केली आहे. कृपया ब्राऊझर सेटिंग्जमधून सुरू करा.'
              : 'Notifications are blocked in your browser settings. Please allow notifications to proceed.'
          );
          return;
        }
      }
      const updated: NotificationSettings = { ...settings, enabled: true, language };
      setSettings(updated);
      saveNotificationSettings(updated);
      setErrorMessage(null);
      await registerPeriodicDailySync();
      await scheduleFutureDailyAlarms(7, settings.time, language);
      void getNotificationCapabilities().then(setCapabilities);
    } else {
      const updated: NotificationSettings = { ...settings, enabled: false, language };
      setSettings(updated);
      saveNotificationSettings(updated);
      await unregisterPeriodicDailySync();
    }
  };

  const handleChangeTime = (time: string) => {
    if (!time) return;
    const updated: NotificationSettings = { ...settings, time, language };
    setSettings(updated);
    saveNotificationSettings(updated);
    if (settings.enabled) {
      void scheduleFutureDailyAlarms(7, time, language);
    }
  };

  const handleToggleSound = () => {
    const updated: NotificationSettings = { ...settings, soundEnabled: !settings.soundEnabled, language };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleSchedule7DaysAlarms = async () => {
    setErrorMessage(null);
    setScheduleSuccessMsg(null);

    if (!isNotificationSupported()) {
      setErrorMessage(
        language === 'mr'
          ? 'या ब्राऊझरमध्ये नोटिफिकेशन सुविधा उपलब्ध नाही.'
          : 'Notifications are not supported in this browser.'
      );
      return;
    }

    if (Notification.permission !== 'granted') {
      const res = await requestNotificationPermission(language);
      setPermission(res);
      if (res !== 'granted') {
        setErrorMessage(
          language === 'mr'
            ? 'कृपया नोटिफिकेशन परवानगी द्या जेणेकरून स्मरणपत्र सेट करता येतील.'
            : 'Please allow notification permission to schedule reminders.'
        );
        return;
      }
    }

    const updated: NotificationSettings = { ...settings, enabled: true, language };
    setSettings(updated);
    saveNotificationSettings(updated);

    const periodicOk = await registerPeriodicDailySync();
    const alarmResult = await scheduleFutureDailyAlarms(7, settings.time, language);
    void getNotificationCapabilities().then(setCapabilities);

    if (alarmResult.status === 'permission_denied') {
      setErrorMessage(
        language === 'mr'
          ? 'नोटिफिकेशन परवानगी नाकारली आहे. ब्राऊझर सेटिंग्जमधून परवानगी सुरू करा.'
          : 'Notification permission is denied. Enable notifications in browser settings.'
      );
      return;
    }

    if (alarmResult.status === 'failed' && !periodicOk) {
      setErrorMessage(
        language === 'mr'
          ? 'बॅकग्राउंड स्मरणपत्र नोंदणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा किंवा अ‍ॅप उघडे असताना स्मरणपत्र वापरा.'
          : 'Background reminder registration was rejected by the browser. Please retry or use in-app reminders.'
      );
      return;
    }

    setScheduleSuccessMsg(
      alarmResult.status === 'scheduled' && alarmResult.scheduledCount > 0
        ? language === 'mr'
          ? `✅ पुढील ${alarmResult.scheduledCount} दिवसांचे स्मरणपत्र (${settings.time}) शेड्यूल झाले (ब्राऊझर क्षमतेनुसार बेस्ट-एफर्ट).`
          : `✅ Scheduled ${alarmResult.scheduledCount} daily reminders (${settings.time}) via browser triggers (best-effort).`
        : periodicOk
        ? language === 'mr'
          ? `✅ प्राधान्ये (${settings.time}) सेव्ह झाली व Periodic Background Sync नोंदणी झाली. अ‍ॅप उघडे असताना किंवा ब्राऊझरने परवानगी दिल्यास सूचना येईल.`
          : `✅ Preferences (${settings.time}) saved and Periodic Sync registered. Exact background triggers are unsupported on this browser, so reminders run best-effort.`
        : language === 'mr'
        ? `ℹ️ प्राधान्ये (${settings.time}) सेव्ह झाली. या ब्राऊझरमध्ये बॅकग्राउंड अलार्म शेड्युलिंग उपलब्ध नाही; अ‍ॅप उघडे असताना स्मरणपत्र दाखवले जाईल.`
        : `ℹ️ Preferences (${settings.time}) saved. Background alarm triggers are not supported on this browser; reminders will appear while the app is open.`
    );
    setTimeout(() => setScheduleSuccessMsg(null), 6500);
  };

  const handleDelayedBgTest = async () => {
    setErrorMessage(null);
    setTestSent(false);

    if (!isNotificationSupported()) {
      setErrorMessage(
        language === 'mr'
          ? 'या ब्राऊझरमध्ये नोटिफिकेशन सुविधा उपलब्ध नाही.'
          : 'Notifications are not supported in this browser.'
      );
      return;
    }

    if (Notification.permission !== 'granted') {
      const res = await requestNotificationPermission(language);
      setPermission(res);
      if (res !== 'granted') {
        setErrorMessage(
          language === 'mr'
            ? 'कृपया नोटिफिकेशन परवानगी द्या.'
            : 'Please allow notification permission.'
        );
        return;
      }
    }

    const result = await testBackgroundNotification(5, language);
    if (!result.ok) {
      setErrorMessage(
        result.reason === 'permission_denied'
          ? language === 'mr'
            ? 'नोटिफिकेशन परवानगी नाकारली आहे. कृपया ब्राऊझर सेटिंग्जमध्ये परवानगी द्या.'
            : 'Notification permission is denied. Please enable it in browser settings.'
          : result.reason === 'no_service_worker'
          ? language === 'mr'
            ? 'सर्व्हिस वर्कर अद्याप सक्रिय नाही. कृपया पान रिफ्रेश करून पुन्हा प्रयत्न करा.'
            : 'Background service worker is not active yet. Please reload the app and try again.'
          : result.reason === 'unsupported'
          ? language === 'mr'
            ? 'या ब्राऊझरमध्ये बॅकग्राउंड चाचणी सूचना उपलब्ध नाही.'
            : 'Background test notifications are not supported on this browser.'
          : language === 'mr'
          ? 'बॅकग्राउंड चाचणी सूचना सुरू करता आली नाही. कृपया पुन्हा प्रयत्न करा.'
          : 'Background test notification request was not accepted. Please try again.'
      );
      return;
    }

    setBgTestCountdown(5);

    const timer = setInterval(() => {
      setBgTestCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTestNotification = async () => {
    setErrorMessage(null);
    setTestSent(false);

    if (isNotificationSupported() && Notification.permission !== 'granted') {
      const res = await requestNotificationPermission();
      setPermission(res);
      if (res !== 'granted') {
        setErrorMessage(
          language === 'mr'
            ? 'कृपया नोटिफिकेशन परवानगी द्या जेणेकरून आम्ही आपल्याला सूचना पाठवू शकू.'
            : 'Please allow notification permission to receive daily alerts.'
        );
        return;
      }
    }

    const success = await sendDailyNotification(
      todayInfo.dayData,
      language,
      settings.soundEnabled
    );

    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4500);
    } else {
      setErrorMessage(
        language === 'mr'
          ? 'सूचना पाठवताना अडचण आली. चाचणी ऑडिओ वाजवला आहे.'
          : 'Could not send system notification. Bell sound played.'
      );
    }
  };

  // Custom Timer Actions
  const getPurposeLabel = (key: string) => {
    switch (key) {
      case 'japa':
        return t('purposeJapa');
      case 'aarti':
        return t('purposeAarti');
      case 'moonrise':
        return t('purposeMoonrise');
      default:
        return t('purposeGeneral');
    }
  };

  const handleStartTimer = async () => {
    setErrorMessage(null);
    setTimerSuccessMsg(null);

    const mins = customInputMinutes ? parseInt(customInputMinutes, 10) : selectedMinutes;
    if (isNaN(mins) || mins <= 0) {
      setErrorMessage(
        language === 'mr' ? 'कृपया योग्य मिनिटे निवडा.' : 'Please enter valid minutes.'
      );
      return;
    }

    if (isNotificationSupported() && Notification.permission !== 'granted') {
      const res = await requestNotificationPermission();
      setPermission(res);
    }

    const targetTime = Date.now() + mins * 60 * 1000;
    const newState: CustomTimerState = {
      active: true,
      targetTimestamp: targetTime,
      totalMinutes: mins,
      purpose: timerPurpose,
      soundEnabled: settings.soundEnabled,
    };

    saveCustomTimerState(newState);
    setTimerState(newState);
    setTimerSuccessMsg(t('timerSetSuccess'));
  };

  const handleStartQuickTest = async () => {
    setErrorMessage(null);
    setTimerSuccessMsg(null);

    if (isNotificationSupported() && Notification.permission !== 'granted') {
      const res = await requestNotificationPermission();
      setPermission(res);
    }

    const targetTime = Date.now() + 10 * 1000;
    const newState: CustomTimerState = {
      active: true,
      targetTimestamp: targetTime,
      totalMinutes: 1,
      purpose: timerPurpose,
      soundEnabled: settings.soundEnabled,
    };

    saveCustomTimerState(newState);
    setTimerState(newState);
    setTimerSuccessMsg(
      language === 'mr'
        ? '१० सेकंदांचा चाचणी टायमर सुरू झाला! १० सेकंदात नोटिफिकेशन येईल.'
        : '10-second test timer started! Notification will arrive in 10s.'
    );
  };

  const handleCancelTimer = () => {
    saveCustomTimerState(null);
    setTimerState(null);
    setRemainingSeconds(0);
    setTimerSuccessMsg(null);
  };

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-orange-200 overflow-hidden flex flex-col max-h-[90dvh] pb-[env(safe-area-inset-bottom)] focus:outline-none"
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 px-4 py-3.5 sm:px-5 sm:py-4 text-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-300 to-yellow-100 ring-2 ring-white/60 shrink-0 shadow-sm overflow-hidden">
              <img
                src="/pwa-192x192.png"
                alt="श्री स्वामी समर्थ"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="min-w-0">
              <h3 id="notification-modal-title" className="text-base sm:text-lg font-black leading-tight text-white truncate">
                {modalTab === 'timer' ? t('customTimerTitle') : t('dailyNotifTitle')}
              </h3>
              <p className="text-[11px] text-amber-100 font-medium leading-tight mt-0.5 truncate">
                {modalTab === 'timer' ? t('customTimerDesc') : t('dailyNotifDesc')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center active:scale-90 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Daily Morning Alert vs Custom Timer */}
        <div className="grid grid-cols-2 gap-1 p-1.5 bg-orange-50/70 border-b border-orange-200 shrink-0">
          <button
            type="button"
            onClick={() => setModalTab('daily')}
            className={`min-h-[44px] py-2 px-2.5 sm:px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 whitespace-nowrap min-w-0 ${
              modalTab === 'daily'
                ? 'bg-white text-orange-950 shadow-xs border border-orange-200'
                : 'text-slate-600 hover:text-orange-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="truncate">{t('dailyAlertTab')}</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab('timer')}
            className={`min-h-[44px] py-2 px-2.5 sm:px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 whitespace-nowrap min-w-0 ${
              modalTab === 'timer'
                ? 'bg-white text-orange-950 shadow-xs border border-orange-200'
                : 'text-slate-600 hover:text-orange-900'
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="truncate">{t('customTimerTab')}</span>
            {timerState?.active && (
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {modalTab === 'daily' ? (
            /* TAB 1: DAILY MORNING ALERT */
            <>
              {/* Main Activation Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/40 border border-orange-200/80">
                <div className="space-y-0.5 pr-2">
                  <span id="daily-notif-switch-label" className="text-sm font-extrabold text-orange-950 block">
                    {t('dailyNotifEnable')}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    {settings.enabled ? t('dailyNotifEnabledStatus') : t('dailyNotifDisabledStatus')}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.enabled}
                  aria-labelledby="daily-notif-switch-label"
                  onClick={handleToggleEnable}
                  className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-orange-600 ${
                    settings.enabled ? 'bg-orange-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      settings.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Honest Best-Effort Background Reminder Capability Card */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 space-y-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-orange-600 shrink-0" />
                  <span className="text-xs font-black text-amber-950">
                    {language === 'mr'
                      ? 'ब्राऊझर स्मरणपत्रे (बेस्ट-एफर्ट / डिव्हाइस क्षमतेनुसार)'
                      : 'Browser Reminders (Best-Effort by Device)'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  {language === 'mr'
                    ? 'वेब अ‍ॅप स्मरणपत्रे अ‍ॅप सुरू असताना ठरलेल्या वेळी खात्रीने चालतात. अ‍ॅप बंद असतानाची सूचना ब्राऊझर व फोनच्या बॅटरी नियमांवर (Best-Effort) अवलंबून असते. बंद केल्यास कोणतीही बॅकग्राउंड सूचना येणार नाही.'
                    : 'Web reminders fire reliably while the app is open. Background delivery when closed is best-effort and depends on your browser and OS battery policy. Turning reminders off stops all background alerts.'}
                </p>

                {capabilities && (
                  <div className="grid grid-cols-2 gap-1.5 text-[10.5px] font-bold pt-0.5">
                    <div className="px-2 py-1.5 rounded-lg bg-white/80 border border-amber-200/70 text-slate-700 truncate whitespace-nowrap">
                      {language === 'mr' ? 'सूचना:' : 'Permission:'}{' '}
                      <span className={permission === 'granted' ? 'text-emerald-700' : 'text-amber-800'}>
                        {permission === 'granted'
                          ? language === 'mr' ? 'मंजूर' : 'Allowed'
                          : permission === 'denied'
                          ? language === 'mr' ? 'बंद' : 'Blocked'
                          : language === 'mr' ? 'बाकी' : 'Ask'}
                      </span>
                    </div>
                    <div className="px-2 py-1.5 rounded-lg bg-white/80 border border-amber-200/70 text-slate-700 truncate whitespace-nowrap">
                      {language === 'mr' ? 'सिंक:' : 'Sync:'}{' '}
                      <span className={capabilities.periodicSync || capabilities.timestampTrigger ? 'text-emerald-700' : 'text-slate-600'}>
                        {capabilities.timestampTrigger
                          ? language === 'mr' ? 'शेड्यूल' : 'Triggers'
                          : capabilities.periodicSync
                          ? language === 'mr' ? 'बेस्ट-एफर्ट' : 'Best-effort'
                          : language === 'mr' ? 'अ‍ॅपमध्ये' : 'In-app'}
                      </span>
                    </div>
                  </div>
                )}

                {/* 1-Tap Schedule / Sync Button */}
                <button
                  type="button"
                  onClick={handleSchedule7DaysAlarms}
                  className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 transition active:scale-98 whitespace-nowrap"
                >
                  <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {language === 'mr'
                      ? '७ दिवसांचे स्मरणपत्र सेव्ह करा'
                      : 'Save & Sync 7-Day Reminders'}
                  </span>
                </button>
              </div>

              {/* Time Picker & Sound Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                    <span>{t('dailyNotifTimeLabel')}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { value: '05:30', label: '०५:३० AM' },
                      { value: '06:00', label: '०६:०० AM' },
                      { value: '07:00', label: '०७:०० AM' },
                      { value: '08:00', label: '०८:०० AM' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChangeTime(opt.value)}
                        className={`min-h-[44px] py-1.5 px-2 rounded-xl text-[11px] font-bold border transition ${
                          settings.time === opt.value
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
                        }`}
                      >
                        {language === 'mr' ? opt.label : opt.value}
                      </button>
                    ))}
                  </div>

                  {/* Custom Time Selection */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-600 shrink-0">
                      {t('customTime')}:
                    </span>
                    <input
                      type="time"
                      value={settings.time}
                      onChange={e => handleChangeTime(e.target.value)}
                      className="min-h-[44px] px-2.5 py-1.5 text-base sm:text-xs font-black rounded-xl border border-orange-300 bg-white text-orange-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                      {settings.soundEnabled ? (
                        <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{t('dailyNotifSound')}</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      {language === 'mr'
                        ? 'मंदिराच्या घंटानादासह सूचना वाजवली जाईल.'
                        : 'A sacred temple bell sound will play with the alert.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`mt-2 min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                      settings.soundEnabled
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    {settings.soundEnabled ? t('bellSoundOn') : t('bellSoundOff')}
                  </button>
                </div>
              </div>

              {/* Today's Live Preview */}
              <div className="rounded-2xl bg-orange-50/70 p-3.5 border border-orange-200 space-y-2">
                <div className="flex items-center justify-between flex-nowrap gap-2">
                  <span className="text-xs font-black text-orange-950 flex items-center gap-1.5 min-w-0 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span className="truncate">{t('todayPreview')}</span>
                  </span>
                  <span className="text-[10px] font-bold text-orange-800 bg-orange-200/60 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 tabular-nums">
                    {settings.time}
                  </span>
                </div>

                <div className="rounded-xl bg-white p-3 shadow-xs border border-orange-100 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center text-sm font-black shrink-0 mt-0.5">
                    ॐ
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                      {todayMessage.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-snug mt-1">
                      {todayMessage.body}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Instant Test + 5s Background Test (Close App) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-white border border-orange-300 text-orange-900 font-bold text-xs hover:bg-orange-50 active:scale-98 flex items-center justify-center gap-1.5 transition shadow-2xs whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="truncate">{t('dailyNotifTestBtn')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDelayedBgTest}
                  disabled={bgTestCountdown !== null}
                  className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-1.5 transition shadow-xs disabled:opacity-75 whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span className="truncate">
                    {bgTestCountdown !== null
                      ? language === 'mr'
                        ? `अॅप बंद करा (${bgTestCountdown}s)...`
                        : `Close App (${bgTestCountdown}s)...`
                      : language === 'mr'
                      ? '५ से. बॅकग्राउंड चाचणी'
                      : '5s Background Test'}
                  </span>
                </button>
              </div>

              {bgTestCountdown !== null && (
                <div className="p-3 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold text-center">
                  🔔{' '}
                  {language === 'mr'
                    ? 'कृपया आता होम स्क्रीनवर जा किंवा फोन लॉक करा! ५ सेकंदात नोटिफिकेशन येईल.'
                    : 'Please go to home screen or lock your phone now! Notification will pop up in 5s.'}
                </div>
              )}

              {/* Collapsible Android Battery Optimization Tips */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowBatteryHelp(!showBatteryHelp)}
                  className="w-full min-h-[44px] p-2.5 text-left text-xs font-bold text-slate-800 flex items-center justify-between flex-nowrap gap-2 hover:bg-slate-100/70"
                >
                  <span className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">
                      {language === 'mr'
                        ? 'अॅप बंद असताना सूचना न आल्यास?'
                        : 'Closed-app notification tips'}
                    </span>
                  </span>
                  {showBatteryHelp ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {showBatteryHelp && (
                  <div className="p-3 pt-0 text-[11px] text-slate-600 space-y-1.5 border-t border-slate-200/60 mt-1 leading-relaxed">
                    <p className="font-semibold text-slate-800">
                      {language === 'mr'
                        ? 'Android डिव्हाइसवर बॅकग्राउंड नोटिफिकेशन सुरळीत चालण्यासाठी:'
                        : 'To ensure seamless background notifications on Android:'}
                    </p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>
                        {language === 'mr'
                          ? 'अॅप "Install" (मोबाईल होम स्क्रीनवर स्थापित) करा.'
                          : 'Install the app on your mobile home screen (PWA).'}
                      </li>
                      <li>
                        {language === 'mr'
                          ? 'मोबाईल Settings -> Apps -> "स्वामी समर्थ" -> Battery मध्ये जाऊन "Unrestricted" (अमर्यादित) निवडा.'
                          : 'In phone Settings -> Apps -> App Info -> Battery, set to "Unrestricted" so Android does not kill background alarms.'}
                      </li>
                      <li>
                        {language === 'mr'
                          ? 'रील वरील "पुढील ७ दिवसांचे दैनिक अलार्म शेड्यूल करा" बटण दाबा.'
                          : 'Tap "Schedule Next 7 Days Daily Alarms" button above.'}
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* TAB 2: CUSTOM NOTIFICATION TIMER OPTION */
            <>
              {timerState?.active ? (
                <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 p-4 text-white shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-xs">
                        <Timer
                          className="w-5 h-5 text-amber-200 animate-spin"
                          style={{ animationDuration: '4s' }}
                        />
                      </span>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-emerald-100 font-black block">
                          {t('timerRunning')}
                        </span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-white">
                          {getPurposeLabel(timerState.purpose)}
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-black">
                      {timerState.totalMinutes} {t('minutes')}
                    </span>
                  </div>

                  {/* Big Countdown Digits */}
                  <div className="text-center py-3 bg-black/20 rounded-2xl backdrop-blur-xs border border-white/20">
                    <div className="text-3xl sm:text-4xl font-black tracking-wider text-amber-200 font-mono">
                      {formatSeconds(remainingSeconds)}
                    </div>
                    <p className="text-[11px] text-emerald-100 mt-1">
                      {t('timerRemaining')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancelTimer}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-white text-rose-700 font-black text-xs hover:bg-rose-50 active:scale-98 transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Square className="w-3.5 h-3.5 text-rose-600 fill-current" />
                    <span>{t('stopTimer')}</span>
                  </button>
                </div>
              ) : (
                /* Timer Configuration Form */
                <div className="space-y-4">
                  {/* Select Duration */}
                  <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-2">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-600" />
                      <span>{t('selectDuration')}</span>
                    </label>

                    <div className="grid grid-cols-3 xs:grid-cols-6 gap-1.5">
                      {[5, 10, 15, 20, 30, 45].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            setSelectedMinutes(mins);
                            setCustomInputMinutes('');
                          }}
                          className={`min-h-[44px] py-2 rounded-xl text-xs font-bold border transition ${
                            selectedMinutes === mins && !customInputMinutes
                              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between flex-nowrap gap-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap shrink-0">
                        {t('customMinutes')}:
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max="360"
                        placeholder="उदा. 25"
                        value={customInputMinutes}
                        onChange={(e) => {
                          setCustomInputMinutes(e.target.value);
                          if (e.target.value) {
                            setSelectedMinutes(parseInt(e.target.value, 10) || 15);
                          }
                        }}
                        className="w-24 sm:w-28 min-h-[44px] px-2.5 py-1.5 text-base sm:text-sm font-bold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="text-[11px] text-slate-500 whitespace-nowrap shrink-0">{t('minutes')}</span>
                    </div>
                  </div>

                  {/* Select Purpose */}
                  <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-2">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span>{t('reminderPurpose')}</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'japa', label: t('purposeJapa') },
                        { key: 'aarti', label: t('purposeAarti') },
                        { key: 'moonrise', label: t('purposeMoonrise') },
                        { key: 'general', label: t('purposeGeneral') },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setTimerPurpose(item.key)}
                          className={`min-h-[44px] px-2.5 py-2 rounded-xl text-[11px] font-black border text-left transition flex items-center gap-1.5 whitespace-nowrap min-w-0 ${
                            timerPurpose === item.key
                              ? 'bg-orange-50 text-orange-950 border-orange-500 ring-1 ring-orange-400'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons: Start Timer + Quick 10s Test */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleStartTimer}
                      className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-950/10 flex items-center justify-center gap-2 transition whitespace-nowrap"
                    >
                      <Play className="w-4 h-4 fill-current shrink-0" />
                      <span className="truncate">{t('startTimer')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartQuickTest}
                      className="w-full min-h-[44px] py-3 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-xs sm:text-sm shadow-md shadow-amber-900/10 flex items-center justify-center gap-1.5 transition whitespace-nowrap"
                    >
                      <Zap className="w-4 h-4 fill-current shrink-0" />
                      <span className="truncate">
                        {language === 'mr' ? '१० सेकंद जलद चाचणी' : '10s Quick Test'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Feedback & Error states */}
          {scheduleSuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2 text-xs font-bold animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{scheduleSuccessMsg}</span>
            </div>
          )}

          {timerSuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs font-bold animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{timerSuccessMsg}</span>
            </div>
          )}

          {testSent && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs font-bold animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('dailyNotifTestedSuccess')}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
