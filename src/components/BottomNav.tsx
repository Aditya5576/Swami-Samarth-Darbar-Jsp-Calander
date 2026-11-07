import React from 'react';
import { Calendar, Sparkles, BookOpen, Compass } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type MainTabType = 'calendar' | 'festivals' | 'nitya_seva' | 'muhurat_info';

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
      sublabel: t('subnavCalendar'),
      icon: Calendar,
    },
    {
      id: 'festivals' as MainTabType,
      label: t('navFestivals'),
      sublabel: t('subnavFestivals'),
      icon: Sparkles,
    },
    {
      id: 'nitya_seva' as MainTabType,
      label: t('navSeva'),
      sublabel: t('subnavSeva'),
      icon: BookOpen,
    },
    {
      id: 'muhurat_info' as MainTabType,
      label: t('navGurupith'),
      sublabel: t('subnavGurupith'),
      icon: Compass,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-orange-200/80 shadow-lg shadow-orange-950/10 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 px-1 py-1 sm:py-1.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-2xl transition-all duration-150 active:scale-90 ${
                isActive
                  ? 'text-orange-700 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-orange-100 text-orange-700 scale-110 shadow-xs' : ''
                }`}
              >
                <Icon className="w-5 h-5 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight mt-0.5 whitespace-nowrap text-center">
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
