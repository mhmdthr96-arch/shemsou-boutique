import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  ShoppingBag,
  Crown,
  Footprints,
  Briefcase,
  Gem
} from 'lucide-react';

const ICON_MAP = {
  Sparkles: Sparkles,
  ShoppingBag: ShoppingBag,
  Crown: Crown,
  Footprints: Footprints,
  Briefcase: Briefcase,
  Gem: Gem
};

export default function CategoryNav({ categories = [], selectedCategory = 'all', onSelectCategory }) {
  const { lang } = useLanguage();

  return (
    <div id="categories-section" className="category-pills-row">
      {categories.map((cat) => {
        const IconComponent = ICON_MAP[cat.icon] || Sparkles;
        const name =
          lang === 'ar'
            ? cat.name_ar
            : lang === 'fr'
            ? cat.name_fr || cat.name_ar
            : cat.name_en || cat.name_ar;

        const isActive = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            className={`category-pill-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            <IconComponent size={16} color={isActive ? '#000' : '#D4AF37'} />
            <span>{name}</span>
          </button>
        );
      })}
    </div>
  );
}
