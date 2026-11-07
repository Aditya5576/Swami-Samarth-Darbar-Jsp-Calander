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
  X,
  ZoomIn,
} from 'lucide-react';

export const MuhuratAndSevaMargView: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'gurupith' | 'muhurat' | 'departments'>('gurupith');
  const [addressCopied, setAddressCopied] = useState(false);
  const [showFullDarshan, setShowFullDarshan] = useState(false);

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
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 sm:p-5 shadow-xs border border-orange-200 space-y-4">
            {/* Direct Murti Darshan Showcase - Dignified Portrait Framing */}
            <div className="space-y-3">
              {/* Header Label */}
              <div className="flex items-center justify-between pb-1.5 border-b border-orange-200/70">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span className="font-black text-xs sm:text-sm text-orange-950 uppercase tracking-wide">
                    {language === 'mr' ? 'प्रत्यक्ष मूर्ती दर्शन' : 'Direct Murti Darshan'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 text-[10px] font-black border border-orange-300">
                  {language === 'mr' ? 'जयसिंगपूर दरबार' : 'Jaysingpur Darbar'}
                </span>
              </div>

              {/* Authentic Jaysingpur Murti Portrait Frame */}
              <div
                onClick={() => setShowFullDarshan(true)}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-300 shadow-md bg-stone-950 cursor-pointer max-w-xs sm:max-w-sm mx-auto aspect-[3/4] flex items-center justify-center transition-all hover:border-amber-400 active:scale-[0.99]"
                title={language === 'mr' ? 'पूर्ण दर्शन घेण्यासाठी टॅप करा' : 'Click to view full darshan'}
              >
                <img
                  src="/assets/aistudio/img_2912_1024_edcd846d.jpg"
                  alt="श्री स्वामी समर्थ प्रत्यक्ष मूर्ती दर्शन, जयसिंगपूर दरबार"
                  className="w-full h-full object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-500"
                />

                {/* Subtle bottom chant ribbon - Completely non-obstructive */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-6 text-center">
                  <p className="text-amber-200 font-black text-xs sm:text-sm tracking-wider drop-shadow">
                    ॥ श्री स्वामी समर्थ ॥
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-100/95 font-semibold mt-0.5 underline decoration-amber-400/80">
                    <ZoomIn className="w-3 h-3 text-amber-300" />
                    <span>{language === 'mr' ? 'पूर्ण दर्शन घेण्यासाठी टॅप करा' : 'Tap for full screen darshan'}</span>
                  </span>
                </div>
              </div>

              {/* Devotional Mahamantra Ribbon */}
              <div className="text-center py-2 px-3 rounded-xl bg-amber-100/70 border border-amber-200">
                <p className="text-xs sm:text-sm font-extrabold text-orange-950 tracking-tight leading-snug">
                  ॥ अनंतकोटी ब्रह्मांडनायक राजाधिराज योगीराज सद्गुरु श्री स्वामी समर्थ महाराज की जय ॥
                </p>
              </div>
            </div>

            {/* Official Center Identity */}
            <div className="flex items-start gap-3 pt-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-0.5 bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 ring-2 ring-amber-400 shrink-0 shadow-sm overflow-hidden">
                <img
                  src="/pwa-192x192.png"
                  alt="श्री स्वामी समर्थ"
                  className="w-full h-full object-cover rounded-xl"
                />
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
                  <Phone className="w-4 h-4 text-orange-600 shrink-0 mt-1" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="font-bold text-slate-900 text-xs">{language === 'mr' ? 'संपर्क अधिकारी:' : 'Contacts:'}</p>
                    <div className="space-y-2 w-full">
                      <a
                        href="tel:+919960401550"
                        className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-orange-50/90 hover:bg-orange-100/90 border border-orange-200 transition group w-full"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-slate-700 truncate">
                            {language === 'mr' ? 'श्री गोवर्धन डबाडे (अण्णा)' : 'Shri Govardhan Dabade (Anna)'}
                          </p>
                          <span className="text-xs sm:text-sm font-black text-orange-950 font-mono tracking-wide block mt-0.5">
                            +91 99604 01550
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-600 text-white font-bold text-[11px] shrink-0 shadow-2xs group-hover:bg-orange-700 transition">
                          <Phone className="w-3 h-3" />
                          <span>{language === 'mr' ? 'कॉल' : 'Call'}</span>
                        </span>
                      </a>

                      <a
                        href="tel:+919172538720"
                        className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-orange-50/90 hover:bg-orange-100/90 border border-orange-200 transition group w-full"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-slate-700 truncate">
                            {language === 'mr' ? 'कार्यालय संपर्क (जयसिंगपूर दरबार)' : 'Office Contact (Jaysingpur Darbar)'}
                          </p>
                          <span className="text-xs sm:text-sm font-black text-orange-950 font-mono tracking-wide block mt-0.5">
                            +91 91725 38720
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-600 text-white font-bold text-[11px] shrink-0 shadow-2xs group-hover:bg-orange-700 transition">
                          <Phone className="w-3 h-3" />
                          <span>{language === 'mr' ? 'कॉल' : 'Call'}</span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
                  <Mail className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 text-xs block mb-0.5">
                      {language === 'mr' ? 'अधिकृत ईमेल:' : 'Official Email:'}
                    </span>
                    <a
                      href={`mailto:${GURUPITH_INFO.email}`}
                      className="text-orange-900 font-bold hover:underline break-all text-xs block"
                    >
                      {GURUPITH_INFO.email}
                    </a>
                  </div>
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

      {/* Full-Screen Direct Murti Darshan Modal */}
      {showFullDarshan && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-5 animate-in fade-in"
        >
          {/* Top Bar with Title & Close Button */}
          <div className="w-full max-w-xl flex items-center justify-between text-white pt-2 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-black text-sm sm:text-base text-amber-100">
                  {language === 'mr' ? 'प्रत्यक्ष मूर्ती दर्शन' : 'Shree Swami Samarth Darshan'}
                </h3>
                <p className="text-[11px] text-amber-300/80">
                  {language === 'mr' ? 'जयसिंगपूर सेवा दरबार' : 'Jaysingpur Seva Darbar'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFullDarshan(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-90"
              aria-label="Close Darshan"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Full High-Resolution Uncropped Murti Frame */}
          <div className="relative flex-1 w-full max-w-md flex items-center justify-center my-2 overflow-hidden rounded-3xl border-2 border-amber-400/50 shadow-2xl bg-black">
            <img
              src="/assets/aistudio/img_2912_1024_edcd846d.jpg"
              alt="श्री स्वामी समर्थ प्रत्यक्ष मूर्ती दर्शन"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Auspicious Chanting Footer */}
          <div className="w-full max-w-xl text-center space-y-1 pb-2">
            <p className="text-sm sm:text-base font-black text-amber-300 tracking-wide">
              ॥ श्री स्वामी समर्थ जय जय स्वामी समर्थ ॥
            </p>
            <p className="text-xs text-stone-300 font-medium">
              {language === 'mr' ? 'भिऊ नकोस मी तुझ्या पाठीशी आहे' : 'Fear not, I am always with you'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
