import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../lib/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('shemsou_language');
      if (saved && ['ar', 'fr', 'en'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return 'ar';
  });

  const t = translations[lang] || translations.ar;
  const dir = t.dir || (lang === 'ar' ? 'rtl' : 'ltr');

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem('shemsou_language', lang);
    } catch (e) {
      console.error(e);
    }
  }, [lang, dir]);

  const changeLanguage = (newLang) => {
    if (['ar', 'fr', 'en'].includes(newLang)) {
      setLang(newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
