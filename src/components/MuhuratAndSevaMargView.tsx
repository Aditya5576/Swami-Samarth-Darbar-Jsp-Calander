import React, { useState } from 'react';
import { SHUBH_MUHURATS_2026, SEVA_DEPARTMENTS, GURUPITH_INFO } from '../data/calendar2026Data';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  Home,
  Heart,
  Car,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Users,
  Compass,
  Copy,
  Check,
  Video,
  Mail,
  Flame,
  Sprout,
  GraduationCap,
  HeartHandshake,
  Stethoscope,
  Leaf,
  ShieldAlert,
} from 'lucide-react';

export const MuhuratAndSevaMargView: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'gurupith' | 'muhurat' | 'departments'>('gurupith');
  const [addressCopied, setAddressCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(
      `${GURUPITH_INFO.localKendra}\nपत्ता: ${GURUPITH_INFO.localKendraAddress}\nसंपर्क: +91 99604 01550 / +91 91725 38720\nईमेल: ${GURUPITH_INFO.email}\nGoogle Maps: ${GURUPITH_INFO.mapShareUrl}\nDaily Online Seva Meet: ${GURUPITH_INFO.onlineSevaMeetUrl}`
    );
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2500);
  };

  return (
    <div className="space-y-4 max-w-full">
      {/* Sub Tabs */}
      <div className="rounded-2xl bg-white p-1.5 shadow-xs border border-orange-100 flex gap-1">
        <button
          onClick={() => setActiveTab('gurupith')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 text-center truncate ${
            activeTab === 'gurupith'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
              : 'bg-orange-50/70 hover:bg-orange-100 text-orange-950 border border-orange-200/50'
          }`}
        >
          {t('gurupithSubTab')}
        </button>

        <button
          onClick={() => setActiveTab('muhurat')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 text-center truncate ${
            activeTab === 'muhurat'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
              : 'bg-orange-50/70 hover:bg-orange-100 text-orange-950 border border-orange-200/50'
          }`}
        >
          {t('muhuratSubTab')}
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 text-center truncate ${
            activeTab === 'departments'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
              : 'bg-orange-50/70 hover:bg-orange-100 text-orange-950 border border-orange-200/50'
          }`}
        >
          {t('deptSubTab')}
        </button>
      </div>

      {/* 1. Official Jaysingpur Seva Darbar Info Tab */}
      {activeTab === 'gurupith' && (
        <div className="space-y-3.5">
          {/* Main Feature: Jaysingpur Seva Darbar Card */}
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 sm:p-5 shadow-xs border border-orange-200 space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-orange-600 flex items-center justify-center p-2 text-white shrink-0 shadow-sm shadow-orange-900/20">
                <span className="text-xl font-black">ॐ</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white text-[9px] font-black uppercase tracking-wider">
                  {language === 'mr' ? 'सेवा दरबार / सेवा केंद्र' : 'Seva Darbar / Seva Kendra'}
                </span>
                <h2 className="text-base sm:text-lg font-black text-orange-950 mt-1 leading-snug">
                  {GURUPITH_INFO.localKendra}
                </h2>
                <p className="text-xs font-semibold text-amber-800">
                  {language === 'mr' ? 'ता. शिरोळ, जि. कोल्हापूर' : 'Tal. Shirol, Dist. Kolhapur'}
                </p>
              </div>
            </div>

            {/* Spiritual Focus Banner */}
            <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/70 text-xs text-orange-950 leading-relaxed">
              <strong className="text-orange-900 block font-bold mb-0.5">
                {t('spiritualFocusTitle')}:
              </strong>
              {language === 'mr' ? GURUPITH_INFO.spiritualFocusMr : GURUPITH_INFO.spiritualFocusEn}
            </div>

            {/* Address & Contact Box */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-orange-100 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong className="text-slate-900">{language === 'mr' ? 'पत्ता: ' : 'Address: '}</strong>
                  {language === 'mr' ? GURUPITH_INFO.localKendraAddress : GURUPITH_INFO.localKendraAddressEn}
                </p>
              </div>

              {/* Contacts */}
              <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-slate-900">{language === 'mr' ? 'संपर्क अधिकारी:' : 'Contacts:'}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href="tel:+919960401550"
                        className="inline-flex items-center gap-1.5 flex-wrap text-orange-800 hover:text-orange-950 font-bold bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-200"
                      >
                        <span>+91 99604 01550</span>
                        <span className="text-[10px] text-slate-600 font-normal">
                          ({language === 'mr' ? 'श्री गोवर्धन डबाडे / अण्णा' : 'Shri Govardhan Dabade / Anna'})
                        </span>
                      </a>
                      <a
                        href="tel:+919172538720"
                        className="inline-flex items-center gap-1.5 flex-wrap text-orange-800 hover:text-orange-950 font-bold bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-200"
                      >
                        <span>+91 91725 38720</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 pt-1">
                  <Mail className="w-4 h-4 text-orange-600 shrink-0" />
                  <p className="flex items-center gap-1.5 flex-wrap">
                    <strong className="text-slate-900">{language === 'mr' ? 'ईमेल: ' : 'Email: '}</strong>
                    <a
                      href={`mailto:${GURUPITH_INFO.email}`}
                      className="text-orange-800 font-bold hover:underline"
                    >
                      {GURUPITH_INFO.email}
                    </a>
                  </p>
                </div>

                {/* Darshan Timings */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                  <p>
                    <strong className="text-slate-900">{language === 'mr' ? 'दर्शन वेळ: ' : 'Darshan: '}</strong>
                    <span>{GURUPITH_INFO.darshanTimings}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Online Seva & Pournima Palki Google Meet Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-900/15 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <Video className="w-4 h-4 text-white" />
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                      {t('onlineSevaTitle')}
                    </h4>
                    <p className="text-[10px] text-blue-100 font-medium">
                      {t('onlineSevaDesc')}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase">
                  LIVE
                </span>
              </div>
              <a
                href={GURUPITH_INFO.onlineSevaMeetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Video className="w-3.5 h-3.5 text-blue-700" />
                <span>{t('joinOnlineMeet')}</span>
                <ExternalLink className="w-3 h-3 text-blue-700" />
              </a>
            </div>

            {/* Action Buttons: Unified Map Navigation + Copy Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href={GURUPITH_INFO.mapShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{language === 'mr' ? 'गूगल मॅपवर मंदिर स्थान व मार्ग' : 'Open Temple on Google Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>

              <button
                onClick={handleCopyAddress}
                className="w-full py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 font-bold text-xs border border-orange-200/90 shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                {addressCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 font-extrabold">{t('addressCopied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-orange-700 shrink-0" />
                    <span>{t('copyAddress')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Key Seva Activities & Special Events */}
            <div className="space-y-2 pt-1">
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-slate-800 leading-relaxed">
                <strong className="text-orange-950 font-extrabold">
                  {language === 'mr' ? 'दैनिक नित्य सेवा: ' : 'Daily Seva: '}
                </strong>
                {GURUPITH_INFO.localActivitiesMr}
              </div>

              <div className="p-3 rounded-xl bg-orange-50/80 border border-orange-200/80 text-xs text-slate-800 leading-relaxed">
                <strong className="text-orange-950 font-extrabold flex items-center gap-1 mb-0.5">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span>{t('specialEventsTitle')}:</span>
                </strong>
                {language === 'mr' ? GURUPITH_INFO.specialEventsMr : GURUPITH_INFO.specialEventsEn}
              </div>
            </div>
          </div>

          {/* Aarti & Daily Schedule Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-orange-100 shadow-xs space-y-2.5 text-xs">
            <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>{t('aartiScheduleTitle')}</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
              {GURUPITH_INFO.aartiTimings.map((a, i) => (
                <div key={i} className="p-2 rounded-xl bg-orange-50/70 border border-orange-100">
                  <strong className="text-orange-950 block text-[11px]">{a.name}</strong>
                  <span className="text-slate-800 font-bold">{a.time}</span>
                </div>
              ))}
            </div>
            <p className="text-slate-700 pt-1 text-[11px] leading-relaxed">
              <strong className="text-orange-900">{t('freeMahaprasad')}</strong> {GURUPITH_INFO.mahaPrasadTimings}
            </p>
          </div>
        </div>
      )}

      {/* 2. Shubh Muhurat Tab */}
      {activeTab === 'muhurat' && (
        <div className="space-y-3.5">
          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 shadow-xs border border-orange-100">
            <h2 className="text-base sm:text-lg font-black text-orange-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <span>{t('muhuratTitle')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t('muhuratDesc')}
            </p>
          </div>

          {SHUBH_MUHURATS_2026.map(category => (
            <div
              key={category.id}
              className="rounded-2xl sm:rounded-3xl bg-white p-3.5 sm:p-4 shadow-xs border border-orange-100 space-y-2.5"
            >
              <div className="flex items-center gap-2.5 pb-2 border-b border-orange-100">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                  {category.category === 'vivah' ? <Heart className="w-4 h-4" /> : category.category === 'vastu' ? <Home className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-orange-950">
                    {language === 'mr' ? category.titleMr : category.titleEn}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {category.descriptionMr}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                {category.dates2026.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-100/80 flex items-center justify-between text-xs gap-2"
                  >
                    <div>
                      <span className="font-extrabold text-orange-950">{m.dayMr}</span>
                      <span className="text-slate-500 text-[11px] ml-1.5 font-medium">({m.nakshatra})</span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-bold text-[10px]">
                        {m.muhuratTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Seva Marg 18 Departments Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-3.5">
          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 shadow-xs border border-orange-100">
            <h2 className="text-base sm:text-lg font-black text-orange-950 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span>{t('deptTitle')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t('deptDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SEVA_DEPARTMENTS.map(dept => {
              const renderIcon = () => {
                switch (dept.iconName) {
                  case 'Sprout':
                    return <Sprout className="w-4 h-4 text-emerald-600" />;
                  case 'GraduationCap':
                    return <GraduationCap className="w-4 h-4 text-orange-600" />;
                  case 'HeartHandshake':
                    return <HeartHandshake className="w-4 h-4 text-rose-600" />;
                  case 'Users':
                    return <Users className="w-4 h-4 text-blue-600" />;
                  case 'Compass':
                    return <Compass className="w-4 h-4 text-purple-600" />;
                  case 'Stethoscope':
                    return <Stethoscope className="w-4 h-4 text-teal-600" />;
                  case 'Leaf':
                    return <Leaf className="w-4 h-4 text-green-600" />;
                  case 'ShieldAlert':
                    return <ShieldAlert className="w-4 h-4 text-amber-600" />;
                  default:
                    return <Sparkles className="w-4 h-4 text-orange-600" />;
                }
              };

              return (
                <div
                  key={dept.id}
                  className="p-3 sm:p-3.5 rounded-2xl bg-white border border-orange-100 shadow-2xs hover:border-orange-300 transition-all space-y-2"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {renderIcon()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                          {language === 'mr' ? dept.titleMr : dept.titleEn}
                        </h3>
                        {dept.badge && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[9px] font-bold shrink-0">
                            {dept.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-1">
                        {dept.descriptionMr}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
