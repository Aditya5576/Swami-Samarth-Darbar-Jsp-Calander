import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getTodayDateInfo } from '../utils/calendarLogic';
import {
  getNotificationSettings,
  saveNotificationSettings,
  sendDailyNotification,
  requestNotificationPermission,
  isNotificationSupported,
  buildTodayNotificationMessage,
  NotificationSettings,
  getCustomTimerState,
  saveCustomTimerState,
  sendTimerAlertNotification,
  CustomTimerState,
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
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
    const current = getCustomTimerState();
    setTimerState(current);
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
        const res = await requestNotificationPermission();
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
      const updated = { ...settings, enabled: true };
      setSettings(updated);
      saveNotificationSettings(updated);
      setErrorMessage(null);
    } else {
      const updated = { ...settings, enabled: false };
      setSettings(updated);
      saveNotificationSettings(updated);
    }
  };

  const handleChangeTime = (time: string) => {
    if (!time) return;
    const updated = { ...settings, time };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(updated);
    saveNotificationSettings(updated);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-orange-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 px-4 py-3.5 sm:px-5 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-amber-200 shrink-0">
              {modalTab === 'timer' ? (
                <Timer className="w-5 h-5 text-white" />
              ) : (
                <Bell className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black leading-tight text-white">
                  {modalTab === 'timer' ? t('customTimerTitle') : t('dailyNotifTitle')}
                </h3>
              </div>
              <p className="text-[11px] text-amber-100 font-medium leading-tight mt-0.5">
                {modalTab === 'timer' ? t('customTimerDesc') : t('dailyNotifDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-90 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Daily Morning Alert vs Custom Timer */}
        <div className="grid grid-cols-2 p-1.5 bg-orange-50/70 border-b border-orange-200 shrink-0">
          <button
            type="button"
            onClick={() => setModalTab('daily')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              modalTab === 'daily'
                ? 'bg-white text-orange-950 shadow-xs border border-orange-200'
                : 'text-slate-600 hover:text-orange-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-orange-600" />
            <span>{t('dailyAlertTab')}</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab('timer')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              modalTab === 'timer'
                ? 'bg-white text-orange-950 shadow-xs border border-orange-200'
                : 'text-slate-600 hover:text-orange-900'
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-orange-600" />
            <span>{t('customTimerTab')}</span>
            {timerState?.active && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
                  <span className="text-sm font-extrabold text-orange-950 block">
                    {t('dailyNotifEnable')}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {settings.enabled ? t('dailyNotifEnabledStatus') : t('dailyNotifDisabledStatus')}
                  </span>
                </div>
                <button
                  onClick={handleToggleEnable}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.enabled ? 'bg-orange-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      settings.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
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
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition ${
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
                      className="px-2 py-1 text-xs font-black rounded-xl border border-orange-300 bg-white text-orange-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    className={`mt-2 py-1.5 px-3 rounded-xl text-xs font-bold border transition text-center ${
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
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    {t('todayPreview')}
                  </span>
                  <span className="text-[10px] font-bold text-orange-800 bg-orange-200/60 px-2 py-0.5 rounded-full">
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

              {/* Action Button: Test Notification Now */}
              <button
                onClick={handleTestNotification}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:scale-98 text-white font-black text-sm shadow-md shadow-orange-900/10 flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                <span>{t('dailyNotifTestBtn')}</span>
              </button>
            </>
          ) : (
            /* TAB 2: CUSTOM NOTIFICATION TIMER OPTION */
            <>
              {timerState?.active ? (
                <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 p-4 text-white shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-xs">
                        <Timer className="w-5 h-5 text-amber-200 animate-spin" style={{ animationDuration: '4s' }} />
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
                    onClick={handleCancelTimer}
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-rose-700 font-black text-xs hover:bg-rose-50 active:scale-98 transition flex items-center justify-center gap-2 shadow-xs"
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

                    <div className="grid grid-cols-6 gap-1">
                      {[1, 5, 10, 15, 30, 60].map(mins => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            setSelectedMinutes(mins);
                            setCustomInputMinutes('');
                          }}
                          className={`py-1.5 rounded-xl text-[11px] font-bold border transition text-center ${
                            selectedMinutes === mins && !customInputMinutes
                              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
                          }`}
                        >
                          {mins} {t('minutes')}
                        </button>
                      ))}
                    </div>

                    {/* Custom Minutes Input */}
                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-600 shrink-0">
                        {t('customMinutes')}:
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="360"
                        placeholder="उदा. 45"
                        value={customInputMinutes}
                        onChange={e => {
                          setCustomInputMinutes(e.target.value);
                          if (e.target.value) {
                            setSelectedMinutes(parseInt(e.target.value, 10) || 15);
                          }
                        }}
                        className="w-24 px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="text-[11px] text-slate-500">{t('minutes')}</span>
                    </div>
                  </div>

                  {/* Select Purpose */}
                  <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-2">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-600" />
                      <span>{t('reminderPurpose')}</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'japa', label: t('purposeJapa') },
                        { key: 'aarti', label: t('purposeAarti') },
                        { key: 'moonrise', label: t('purposeMoonrise') },
                        { key: 'general', label: t('purposeGeneral') },
                      ].map(item => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setTimerPurpose(item.key)}
                          className={`p-2.5 rounded-xl text-[11px] font-black border text-left transition flex items-center gap-1.5 leading-snug ${
                            timerPurpose === item.key
                              ? 'bg-orange-50 text-orange-950 border-orange-500 ring-1 ring-orange-400'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
                          }`}
                        >
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons: Start Timer + Quick 10s Test */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={handleStartTimer}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-950/10 flex items-center justify-center gap-2 transition"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{t('startTimer')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartQuickTest}
                      className="w-full py-3 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-xs sm:text-sm shadow-md shadow-amber-900/10 flex items-center justify-center gap-1.5 transition"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>{language === 'mr' ? '१० सेकंद जलद चाचणी' : '10s Quick Test'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Feedback & Error states */}
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
