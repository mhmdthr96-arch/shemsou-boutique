import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Crown, Sparkles, ShieldCheck, Truck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function HeroBanner({ onExploreClick }) {
  const { t, dir } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="hero-banner">
      <div className="container">
        <div className="hero-grid">
          {/* Left Text Content */}
          <div className="hero-text-content">
            <div className="gold-badge">
              <Sparkles size={14} color="#D4AF37" />
              <span>COLLECTION 2026 • HAUTE QUALITÉ</span>
            </div>

            <h2 className="hero-title-main">
              <span className="gold-text-gradient">{t.heroTitle}</span>
            </h2>

            <p className="hero-description">{t.heroSubtitle}</p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-luxury"
                onClick={onExploreClick}
              >
                <span>{t.heroCta}</span>
                <ArrowIcon size={16} />
              </button>

              <a
                href="#categories-section"
                className="btn-luxury-outline"
              >
                <span>{t.allCategories}</span>
              </a>
            </div>
          </div>

          {/* Right Image Showcase Card */}
          <div className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80"
              alt="SHEMSOU Luxury Collection"
            />
            <div
              style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '1.5rem',
                right: '1.5rem',
                background: 'rgba(15, 15, 15, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '0',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: '700' }}>
                  SHEMSOU SIGNATURE
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                  Édition Limitée 2026
                </div>
              </div>
              <Crown size={24} color="#D4AF37" />
            </div>
          </div>
        </div>

        {/* 3 Trust & Quality Feature Highlights */}
        <div className="hero-features-bar">
          <div className="feature-box">
            <div className="feature-icon-wrapper">
              <Crown size={22} />
            </div>
            <div>
              <div className="feature-title">{t.feature1Title}</div>
              <div className="feature-desc">{t.feature1Desc}</div>
            </div>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrapper">
              <Truck size={22} />
            </div>
            <div>
              <div className="feature-title">{t.feature2Title}</div>
              <div className="feature-desc">{t.feature2Desc}</div>
            </div>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="feature-title">{t.feature3Title}</div>
              <div className="feature-desc">{t.feature3Desc}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
