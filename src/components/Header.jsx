import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Sparkles, Search } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Header({ onOpenAdmin, onSearchClick }) {
  const { t } = useLanguage();

  return (
    <header className="main-header">
      <div className="container">
        <div className="header-inner">
          {/* Left Side Controls */}
          <div className="header-side">
            <button
              type="button"
              className="btn-luxury-outline"
              onClick={onSearchClick}
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', borderRadius: '30px' }}
            >
              <Search size={15} color="#D4AF37" />
              <span>{t.searchPlaceholder.slice(0, 18)}...</span>
            </button>
          </div>

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

          {/* Right Side Admin Portal Button */}
          <div className="header-side right">
            <button
              type="button"
              className="btn-luxury-outline"
              onClick={onOpenAdmin}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                borderRadius: '30px',
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
