import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { optimizeMediaUrl } from '../lib/cloudinary';

const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    media_url: '/shemsou_hero_slide.jpg',
    media_type: 'image',
    duration: 6,
    title: 'SHEMSOU Luxury Collection',
  },
];

export default function HeroSlider({ slides: propSlides }) {
  const slides = (propSlides && propSlides.length > 0) ? propSlides : DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animDir, setAnimDir] = useState('next'); // 'next' | 'prev'
  const [transitioning, setTransitioning] = useState(false);

  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const progressStart = useRef(null);
  const progressElapsed = useRef(0);

  const currentSlide = slides[current];
  const duration = (currentSlide?.duration || 5) * 1000;

  const goTo = useCallback((idx, dir = 'next') => {
    if (transitioning) return;
    setAnimDir(dir);
    setTransitioning(true);
    setProgress(0);
    progressElapsed.current = 0;
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 500);
  }, [transitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, 'next');
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, 'prev');
  }, [current, slides.length, goTo]);

  // Progress animation
  useEffect(() => {
    if (paused || transitioning) {
      cancelAnimationFrame(progressRef.current);
      if (!transitioning) {
        progressElapsed.current = (progress / 100) * duration;
      }
      return;
    }

    progressStart.current = performance.now() - progressElapsed.current;

    const tick = (now) => {
      const elapsed = now - progressStart.current;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        progressRef.current = requestAnimationFrame(tick);
      } else {
        next();
      }
    };

    progressRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(progressRef.current);
  }, [current, paused, transitioning, duration]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === ' ') { e.preventDefault(); setPaused(p => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  if (!slides.length) return null;

  return (
    <div className="hero-slider" role="region" aria-label="Hero Slider">
      {/* Slides */}
      <div className="hero-slider__track">
        {slides.map((slide, idx) => {
          const isActive = idx === current;
          const isPrev = !isActive;
          return (
            <div
              key={slide.id || idx}
              className={`hero-slider__slide ${isActive ? 'is-active' : ''} ${
                transitioning && isActive ? `entering-${animDir}` : ''
              } ${transitioning && idx === (animDir === 'next' ? (current - 1 + slides.length) % slides.length : (current + 1) % slides.length) ? `leaving-${animDir}` : ''}`}
              aria-hidden={!isActive}
            >
              {slide.media_type === 'video' ? (
                <video
                  src={optimizeMediaUrl(slide.media_url)}
                  autoPlay={isActive && !paused}
                  muted
                  loop={false}
                  playsInline
                  className="hero-slider__media"
                />
              ) : (
                <img
                  src={optimizeMediaUrl(slide.media_url)}
                  alt={slide.title || 'SHEMSOU BOUTIQUE'}
                  className="hero-slider__media"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              )}
              <div className="hero-slider__overlay" />
            </div>
          );
        })}
      </div>

      {/* Progress bars */}
      <div className="hero-slider__progress-bars">
        {slides.map((_, idx) => (
          <div key={idx} className="hero-slider__progress-track">
            <div
              className="hero-slider__progress-fill"
              style={{
                width: idx < current ? '100%' :
                       idx === current ? `${progress}%` : '0%',
                transition: idx === current ? 'none' : 'width 0.3s ease',
              }}
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      {slides.length > 1 && (
        <>
          <button
            className="hero-slider__arrow hero-slider__arrow--prev"
            onClick={prev}
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="hero-slider__arrow hero-slider__arrow--next"
            onClick={next}
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Play/Pause */}
      <button
        className="hero-slider__playpause"
        onClick={() => setPaused(p => !p)}
        aria-label={paused ? 'Play' : 'Pause'}
      >
        {paused ? <Play size={14} /> : <Pause size={14} />}
      </button>

      {/* Dot navigation */}
      {slides.length > 1 && (
        <div className="hero-slider__dots" role="tablist">
          {slides.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === current}
              className={`hero-slider__dot ${idx === current ? 'is-active' : ''}`}
              onClick={() => goTo(idx, idx > current ? 'next' : 'prev')}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
