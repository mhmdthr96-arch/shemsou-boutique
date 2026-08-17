import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Crown, Sparkles, MessageSquare, Phone, Mail, Clock, MapPin } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Footer({ storeSettings, onOpenAdmin }) {
  const { t } = useLanguage();

  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1.5px solid var(--gold-pure)'
                }}
              >
                <img
                  src={logoImg}
                  alt="SHEMSOU"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h3 className="gold-text-gradient" style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                SHEMSOU BOUTIQUE
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.7', color: 'var(--beige-muted)', maxWidth: '320px' }}>
              {t.boutiqueDesc}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ color: 'var(--gold-light)', fontSize: '1rem', marginBottom: '1.25rem' }}>
              {t.quickLinks}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li>
                <a href="#main-catalog" style={{ color: 'var(--beige-muted)', textDecoration: 'none' }}>
                  {t.allCategories}
                </a>
              </li>
              <li>
                <a href="#categories-section" style={{ color: 'var(--beige-muted)', textDecoration: 'none' }}>
                  {t.bestSeller}
                </a>
              </li>
              <li>
                <a href="#catalog-controls" style={{ color: 'var(--beige-muted)', textDecoration: 'none' }}>
                  {t.newArrival}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {t.adminLogin}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Hours */}
          <div>
            <h4 style={{ color: 'var(--gold-light)', fontSize: '1rem', marginBottom: '1.25rem' }}>
              {t.customerCare}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={15} color="#D4AF37" />
                <span>{t.workingHoursVal}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={15} color="#D4AF37" />
                <span>توصيل لكافة الولايات (58 ولاية)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Direct WhatsApp Contact */}
          <div>
            <h4 style={{ color: 'var(--gold-light)', fontSize: '1rem', marginBottom: '1.25rem' }}>
              {t.contactWhatsapp}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              فريق خدمة العملاء جاهز للرد على كافة استفساراتكم ومساعدتكم في اختيار المقاس المناسب.
            </p>
            {storeSettings?.whatsapp_number && (
              <a
                href={`https://wa.me/${storeSettings.whatsapp_number}`}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.7rem' }}
              >
                <MessageSquare size={16} />
                <span>WhatsApp Live Chat</span>
              </a>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>{t.allRightsReserved}</div>
          <div style={{ color: 'var(--gold-light)', fontSize: '0.78rem' }}>
            ⚜️ Haute Maroquinerie & Chaussures de Prestige
          </div>
        </div>
      </div>
    </footer>
  );
}
