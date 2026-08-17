import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from './ProductCard';
import { Sparkles, PackageOpen } from 'lucide-react';

export default function ProductGrid({
  products = [],
  onOpenOrder,
  onResetFilters
}) {
  const { t } = useLanguage();

  if (products.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '5rem 1rem',
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          margin: '2rem 0',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <PackageOpen size={48} color="#D4AF37" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          لم يتم العثور على أي منتج مطابق
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          جرب البحث بكلمات أخرى أو اختر فئة مختلفة
        </p>
        <button
          type="button"
          className="btn-luxury-outline"
          onClick={onResetFilters}
        >
          {t.allCategories}
        </button>
      </div>
    );
  }

  return (
    <div id="main-catalog" className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onOpenOrder={onOpenOrder}
        />
      ))}
    </div>
  );
}
