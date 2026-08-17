import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, ShoppingBag, Sparkles } from 'lucide-react';

export default function StoryViewerModal({
  stories = [],
  initialIndex = 0,
  products = [],
  onClose,
  onOpenProductOrder
}) {
  const { lang, t, dir } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const currentStory = stories[currentIndex];
  const storyDuration = currentStory?.media_type === 'video' ? 12000 : 6000;

  // Find tagged product if any
  const taggedProduct = currentStory?.tagged_product_id
    ? products.find((p) => p.id === currentStory.tagged_product_id)
    : null;

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;

    const interval = 50;
    const step = (interval / storyDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, storyDuration]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!currentStory) return null;

  const title =
    lang === 'ar'
      ? currentStory.title_ar || currentStory.title_fr || currentStory.title_en
      : lang === 'fr'
      ? currentStory.title_fr || currentStory.title_ar || currentStory.title_en
      : currentStory.title_en || currentStory.title_fr || currentStory.title_ar;

  const taggedProductTitle = taggedProduct
    ? lang === 'ar'
      ? taggedProduct.title_ar
      : lang === 'fr'
      ? taggedProduct.title_fr || taggedProduct.title_ar
      : taggedProduct.title_en || taggedProduct.title_ar
    : null;

  return (
    <div className="story-viewer-modal" onClick={onClose}>
      <div
        className="story-viewer-frame"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bar */}
        <div className="story-progress-bar-wrap">
          {stories.map((s, idx) => (
            <div key={s.id || idx} className="story-progress-segment">
              <div
                className="story-progress-fill"
                style={{
                  width:
                    idx < currentIndex
                      ? '100%'
                      : idx === currentIndex
                      ? `${progress}%`
                      : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Controls */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '14px',
            right: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 30
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1.5px solid #D4AF37'
              }}
            >
              <img
                src="/IMG_3498.PNG"
                alt="SHEMSOU"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff' }}>
                SHEMSOU BOUTIQUE
              </div>
              <div style={{ fontSize: '0.7rem', color: '#D4AF37' }}>{title}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {currentStory.media_type === 'video' && (
              <button
                type="button"
                className="modal-close-btn"
                style={{ position: 'static', width: '32px', height: '32px' }}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            )}

            <button
              type="button"
              className="modal-close-btn"
              style={{ position: 'static', width: '32px', height: '32px' }}
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Media Container */}
        <div className="story-media-container">
          {currentStory.media_type === 'video' ? (
            <video
              ref={videoRef}
              src={currentStory.media_url}
              autoPlay
              playsInline
              loop
              muted={isMuted}
            />
          ) : (
            <img src={currentStory.media_url} alt={title || 'Story'} />
          )}
        </div>

        {/* Left / Right Tap zones */}
        <div
          onClick={handlePrev}
          style={{
            position: 'absolute',
            top: '70px',
            bottom: '120px',
            left: 0,
            width: '35%',
            zIndex: 10,
            cursor: 'pointer'
          }}
        />
        <div
          onClick={handleNext}
          style={{
            position: 'absolute',
            top: '70px',
            bottom: '120px',
            right: 0,
            width: '35%',
            zIndex: 10,
            cursor: 'pointer'
          }}
        />

        {/* Bottom Bar: Tagged Product & Action */}
        <div className="story-overlay-bottom">
          {taggedProduct && (
            <div
              style={{
                background: 'rgba(20, 20, 20, 0.9)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '0',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img
                  src={taggedProduct.cover_image}
                  alt={taggedProductTitle}
                  style={{ width: '46px', height: '46px', borderRadius: '0', objectFit: 'cover' }}
                />
                <div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      color: '#fff',
                      maxWidth: '170px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {taggedProductTitle}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#D4AF37' }}>
                    {taggedProduct.price} {t.currency}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-luxury"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                onClick={() => {
                  onClose();
                  onOpenProductOrder(taggedProduct);
                }}
              >
                <ShoppingBag size={13} />
                <span>{t.orderNow}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
