import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Phone, MessageSquare } from 'lucide-react';

export default function AnnouncementBar({ storeSettings }) {
  const { lang, t, changeLanguage } = useLanguage();

  const announcementText =
    lang === 'ar'
      ? storeSettings?.announcement_ar || t.announcement
      : lang === 'fr'
      ? storeSettings?.announcement_fr || t.announcement
      : storeSettings?.announcement_en || t.announcement;

  return (
    <div className="announcement-bar">
      <div className="container">
        <div className="announcement-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={14} color="#D4AF37" />
            <span>{announcementText}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {storeSettings?.whatsapp_number && (
              <a
                href={`https://wa.me/${storeSettings.whatsapp_number}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#D4AF37',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  fontWeight: '600'
                }}
              >
                <MessageSquare size={13} />
                <span>{t.contactWhatsapp}</span>
              </a>
            )}

            {/* Language Switcher */}
            <div className="lang-selector">
              <button
                type="button"
                className={`lang-btn ${lang === 'ar' ? 'active' : ''}`}
                onClick={() => changeLanguage('ar')}
              >
                عربي
              </button>
              <button
                type="button"
                className={`lang-btn ${lang === 'fr' ? 'active' : ''}`}
                onClick={() => changeLanguage('fr')}
              >
                FR
              </button>
              <button
                type="button"
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
