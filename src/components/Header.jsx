import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Sparkles, MessageSquare } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Header({ onOpenAdmin, storeSettings }) {
  const { lang, t, changeLanguage } = useLanguage();

  return (
    <header className="main-header">
      <div className="container">
        <div className="header-inner">
          {/* Left Side Spacer (keeps the logo perfectly centered) */}
          <div className="header-side" />

          {/* Center Brand with Circular Golden Frame Avatar (IMG_3498.PNG) */}
          <a href="#main-catalog" className="logo-center-wrapper" title="SHEMSOU BOUTIQUE">
            <div className="logo-avatar-frame">
              <img
                src={logoImg}
                alt="SHEMSOU BOUTIQUE Logo"
                className="logo-avatar-img"
                onError={(e) => {
                  e.target.src = '/IMG_3498.PNG';
                }}
              />
            </div>
            <h1 className="brand-title gold-text-gradient">SHEMSOU BOUTIQUE</h1>
            <span className="brand-tagline">{t.storeTagline}</span>
          </a>

          {/* Right Side Controls */}
          <div className="header-side right">
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

            {storeSettings?.whatsapp_number && (
              <a
                href={`https://wa.me/${storeSettings.whatsapp_number}`}
                target="_blank"
                rel="noreferrer"
                className="header-whatsapp"
                title={t.contactWhatsapp}
              >
                <MessageSquare size={14} />
                <span>{t.contactWhatsapp}</span>
              </a>
            )}

            <button
              type="button"
              className="btn-luxury-outline"
              onClick={onOpenAdmin}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                borderRadius: '0',
                borderColor: 'rgba(212, 175, 55, 0.4)'
              }}
              title={t.adminLogin}
            >
              <Shield size={15} color="#D4AF37" />
              <span>{t.adminLogin}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
