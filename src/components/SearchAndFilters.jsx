import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function SearchAndFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  totalResults
}) {
  const { t } = useLanguage();

  return (
    <div className="shop-controls-section" id="catalog-controls">
      <div className="container">
        <div className="controls-row">
          {/* Live Search Bar */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon-pos" />
            <input
              type="text"
              className="search-input"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  insetInlineEnd: '1rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ArrowUpDown size={16} color="#D4AF37" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="form-input"
              style={{
                width: 'auto',
                padding: '0.6rem 1.2rem',
                borderRadius: '0',
                background: 'var(--bg-surface)',
                borderColor: 'rgba(212, 175, 55, 0.3)',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <option value="featured">{t.sortFeatured}</option>
              <option value="price-asc">{t.sortPriceAsc}</option>
              <option value="price-desc">{t.sortPriceDesc}</option>
              <option value="newest">{t.sortNewest}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
