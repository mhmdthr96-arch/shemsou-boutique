import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { optimizeMediaUrl } from '../lib/cloudinary';
import { ShoppingBag, Eye, Sparkles } from 'lucide-react';

export default function ProductCard({ product, onOpenOrder }) {
  const { lang, t } = useLanguage();

  const title =
    lang === 'ar'
      ? product.title_ar
      : lang === 'fr'
      ? product.title_fr || product.title_ar
      : product.title_en || product.title_ar;

  // Check if product has any variant in stock
  const totalStock = (product.variants || []).reduce(
    (acc, v) => acc + (Number(v.stock) || 0),
    0
  );
  const isCompletelyOutOfStock =
    (product.variants && product.variants.length > 0 && totalStock === 0) ||
    product.in_stock === false;

  const rawCover =
    product.cover_image ||
    (product.images && product.images.length > 0 ? product.images[0] : '');
  const coverImage = optimizeMediaUrl(rawCover);

  return (
    <div className="product-card">
      {/* Badges Stack */}
      <div className="product-badge-stack">
        {isCompletelyOutOfStock ? (
          <span className="badge-tag out-of-stock">{t.outOfStock}</span>
        ) : product.is_new ? (
          <span className="badge-tag new">{t.newArrival}</span>
        ) : product.is_featured ? (
          <span className="badge-tag new">{t.bestSeller}</span>
        ) : null}
      </div>

      {/* Image Container */}
      <div
        className="product-image-container"
        onClick={() => onOpenOrder(product)}
      >
        <img
          src={coverImage}
          alt={title}
          className="product-cover-img"
          loading="lazy"
        />
      </div>

      {/* Product Content */}
      <div className="product-content">
        <div>
          {/* Colors Preview */}
          {product.colors && product.colors.length > 0 && (
            <div className="product-swatches-preview" style={{ marginBottom: '0.4rem' }}>
              {product.colors.slice(0, 5).map((color, idx) => (
                <span
                  key={color.code || idx}
                  className="color-dot"
                  style={{ backgroundColor: color.hex || '#fff' }}
                  title={
                    lang === 'ar'
                      ? color.name_ar
                      : lang === 'fr'
                      ? color.name_fr || color.name_ar
                      : color.name_en || color.name_ar
                  }
                />
              ))}
              {product.colors.length > 5 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  +{product.colors.length - 5}
                </span>
              )}
            </div>
          )}

          <h3
            className="product-title-text"
            onClick={() => onOpenOrder(product)}
          >
            {title}
          </h3>
        </div>

        {/* Pricing & Direct Order Button */}
        <div>
          <div className="product-price-row" style={{ marginBottom: '0.85rem' }}>
            <span className="price-current">
              {Number(product.price).toLocaleString()} {t.currency}
            </span>
            {product.old_price && Number(product.old_price) > Number(product.price) && (
              <span className="price-old">
                {Number(product.old_price).toLocaleString()} {t.currency}
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn-luxury"
            style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.88rem' }}
            onClick={() => onOpenOrder(product)}
          >
            <ShoppingBag size={16} />
            <span>{t.directOrder}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
