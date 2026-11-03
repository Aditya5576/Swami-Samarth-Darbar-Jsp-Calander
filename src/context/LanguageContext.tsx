import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  TRANSLATIONS,
  TranslationKey,
  MARATHI_DAYS,
  MARATHI_DAYS_SHORT,
  ENGLISH_DAYS,
  ENGLISH_DAYS_SHORT,
} from '../utils/translations';
import { MONTHS_META } from '../data/calendar2026Data';
import { formatMarathiDate } from '../utils/calendarLogic';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  formatDate: (dateStr: string) => string;
  getDayName: (dayOfWeek: number, short?: boolean) => string;
  getMonthName: (monthNumber: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('swami_app_lang') as Language;
      if (saved === 'mr' || saved === 'en') return saved;
    }
    return 'mr'; // default authentic Marathi
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('swami_app_lang', language);
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'mr' ? 'en' : 'mr'));
  };

  const t = (key: TranslationKey): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS.mr[key] || key;
  };

  const formatDate = (dateStr: string): string => {
    if (language === 'mr') {
      return formatMarathiDate(dateStr);
    }
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const monthNamesEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNamesEn[month - 1]} ${day}, ${year}`;
  };

  const getDayName = (dayOfWeek: number, short = false): string => {
    if (language === 'en') {
      return short ? ENGLISH_DAYS_SHORT[dayOfWeek] : ENGLISH_DAYS[dayOfWeek];
    }
    return short ? MARATHI_DAYS_SHORT[dayOfWeek] : MARATHI_DAYS[dayOfWeek];
  };

  const MONTH_NAMES_EN = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const MONTH_NAMES_MR = [
    'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
    'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
  ];

  const getMonthName = (monthNumber: number): string => {
    if (monthNumber < 1 || monthNumber > 12) return '';
    return language === 'en' ? MONTH_NAMES_EN[monthNumber - 1] : MONTH_NAMES_MR[monthNumber - 1];
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        formatDate,
        getDayName,
        getMonthName,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
