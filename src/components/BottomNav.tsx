import React from 'react';
import { Calendar, Sparkles, BookOpen, Compass, ScrollText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type MainTabType = 'calendar' | 'festivals' | 'saramrut' | 'nitya_seva' | 'muhurat_info';

interface BottomNavProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const { t } = useLanguage();

  const tabs = [
    {
      id: 'calendar' as MainTabType,
      label: t('navCalendar'),
      icon: Calendar,
    },
    {
      id: 'festivals' as MainTabType,
      label: t('navFestivals'),
      icon: Sparkles,
    },
    {
      id: 'saramrut' as MainTabType,
      label: t('navSaramrut'),
      icon: ScrollText,
    },
    {
      id: 'nitya_seva' as MainTabType,
      label: t('navSeva'),
      icon: BookOpen,
    },
    {
      id: 'muhurat_info' as MainTabType,
      label: t('navGurupith'),
      icon: Compass,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-orange-200/80 shadow-lg shadow-orange-950/10 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-lg mx-auto grid grid-cols-5 px-1 py-1 sm:py-1.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-orange-700 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-orange-100 text-orange-700 scale-105 shadow-2xs' : ''
                }`}
              >
                <Icon className="w-[19px] h-[19px] sm:w-5 sm:h-5" />
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight mt-0.5 whitespace-nowrap truncate max-w-full text-center">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
