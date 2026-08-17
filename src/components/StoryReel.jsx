import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Play, Sparkles } from 'lucide-react';

export default function StoryReel({ stories = [], onSelectStory }) {
  const { lang, t } = useLanguage();

  if (!stories || stories.length === 0) return null;

  return (
    <section className="story-reel-section">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <Sparkles size={14} color="#D4AF37" />
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--gold-light)', letterSpacing: '0.5px' }}>
            {t.storiesTitle}
          </span>
        </div>

        <div className="story-reel-container">
          {stories.map((story, index) => {
            const title =
              lang === 'ar'
                ? story.title_ar || story.title_fr || story.title_en
                : lang === 'fr'
                ? story.title_fr || story.title_ar || story.title_en
                : story.title_en || story.title_fr || story.title_ar;

            return (
              <button
                key={story.id || index}
                type="button"
                className="story-item-btn"
                onClick={() => onSelectStory(index)}
              >
                <div className="story-ring-wrapper">
                  <img
                    src={story.media_url}
                    alt={title || 'Story'}
                    className="story-thumb-img"
                  />
                  {story.media_type === 'video' && (
                    <div className="story-play-icon">
                      <Play size={10} fill="#000" color="#000" />
                    </div>
                  )}
                </div>
                <span className="story-title-text">{title || t.tapToView}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
