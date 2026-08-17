import React, { useState, useRef, useLayoutEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AnnouncementBar({ storeSettings }) {
  const { lang, t } = useLanguage();

  const announcementText =
    lang === 'ar'
      ? storeSettings?.announcement_ar || t.announcement
      : lang === 'fr'
      ? storeSettings?.announcement_fr || t.announcement
      : storeSettings?.announcement_en || t.announcement;

  // Small plain space between repetitions (non-breaking so it never collapses)
  const separator = '  ';
  const unit = announcementText + separator;

  const measureRef = useRef(null);
  const [copies, setCopies] = useState(3);

  // Measure the single repeating unit and compute how many copies are needed so
  // the track is always wider than 2x the viewport → the loop never shows a gap.
  // Recomputed after web fonts load (width changes) and on resize.
  useLayoutEffect(() => {
    const measure = () => {
      if (!measureRef.current) return;
      const unitWidth = measureRef.current.offsetWidth;
      if (unitWidth > 0) {
        const needed = Math.max(3, Math.ceil((window.innerWidth * 2 * 1.15) / unitWidth));
        setCopies(needed);
      }
    };
    measure();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [announcementText, separator]);

  // Each block ends with the separator, so the seam between the two identical
  // blocks (and every repetition) has the same small space → perfectly continuous.
  const repeated = unit.repeat(copies);

  return (
    <div className="announcement-bar" aria-label={announcementText}>
      <span ref={measureRef} className="announcement-measure">
        {unit}
      </span>
      <div className="announcement-ticker">
        <div className="announcement-track">
          <span>{repeated}</span>
          <span aria-hidden="true">{repeated}</span>
        </div>
      </div>
    </div>
  );
}
