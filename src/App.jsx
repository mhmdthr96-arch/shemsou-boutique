import React, { useState, useEffect, useMemo } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import AnnouncementBar from './components/AnnouncementBar';
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import CategoryNav from './components/CategoryNav';
import SearchAndFilters from './components/SearchAndFilters';
import ProductGrid from './components/ProductGrid';
import DirectOrderModal from './components/DirectOrderModal';
import AdminDashboard from './components/AdminDashboard';
import InstallPrompt from './components/InstallPrompt';
import Footer from './components/Footer';
import {
  getProducts,
  getCategories,
  getSlides,
  getStoreSettings,
  cleanupDemoProducts
} from './lib/supabase';

function StorefrontContent() {
  const { lang } = useLanguage();

  // Core Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slides, setSlides] = useState([]);
  const [storeSettings, setStoreSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Modals
  const [activeOrderProduct, setActiveOrderProduct] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Load Data on Mount
  const loadData = async () => {
    try {
      await cleanupDemoProducts();
      const [prods, cats, slds, settings] = await Promise.all([
        getProducts(),
        getCategories(),
        getSlides(),
        getStoreSettings()
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
      setSlides(slds || []);
      setStoreSettings(settings || {});
    } catch (err) {
      console.error('Failed to load store data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
          return false;
        }
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitleAr = (p.title_ar || '').toLowerCase().includes(q);
          const matchTitleFr = (p.title_fr || '').toLowerCase().includes(q);
          const matchTitleEn = (p.title_en || '').toLowerCase().includes(q);
          const matchDescAr = (p.description_ar || '').toLowerCase().includes(q);
          if (!matchTitleAr && !matchTitleFr && !matchTitleEn && !matchDescAr) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchTerm, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
  };

  return (
    <div className="store-wrapper">
      {/* ⚜️ Luxury Watermark Background */}
      <div className="luxury-bg" aria-hidden="true">
        <div className="luxury-bg__glow" />
        <div className="luxury-bg__watermark">
          <span>SHEMSOU BOUTIQUE</span>
          <span>SHEMSOU BOUTIQUE</span>
          <span>SHEMSOU BOUTIQUE</span>
          <span>SHEMSOU BOUTIQUE</span>
          <span>SHEMSOU BOUTIQUE</span>
          <span>SHEMSOU BOUTIQUE</span>
          <span>SHEMSOU BOUTIQUE</span>
          <span>SHEMSOU BOUTIQUE</span>
        </div>
      </div>

      {/* ⚜️ Hero Slider — Top of page, first thing the visitor sees */}
      <HeroSlider slides={slides} />

      {/* Top Announcement Bar */}
      <AnnouncementBar storeSettings={storeSettings} />

      {/* Main Luxury Header with Central Avatar Logo (IMG_3498.PNG) */}
      <Header
        onOpenAdmin={() => setIsAdminOpen(true)}
        storeSettings={storeSettings}
      />

      {/* Categories & Search Controls */}
      <div className="container">
        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => setSelectedCategory(catId)}
        />
      </div>

      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={(val) => setSearchTerm(val)}
        sortBy={sortBy}
        onSortChange={(val) => setSortBy(val)}
        totalResults={filteredProducts.length}
      />

      {/* Product Catalog Grid */}
      <main className="container">
        <ProductGrid
          products={filteredProducts}
          onOpenOrder={(product) => setActiveOrderProduct(product)}
          onResetFilters={handleResetFilters}
        />
      </main>

      {/* Footer */}
      <Footer
        storeSettings={storeSettings}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Direct Instant Order Modal (No Cart needed) */}
      {activeOrderProduct && (
        <DirectOrderModal
          product={activeOrderProduct}
          storeSettings={storeSettings}
          onClose={() => setActiveOrderProduct(null)}
          onOrderSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* Admin Dashboard */}
      {isAdminOpen && (
        <AdminDashboard
          onClose={() => setIsAdminOpen(false)}
          onDataUpdated={loadData}
        />
      )}

      {/* PWA Install Prompt (per-browser) */}
      <InstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <StorefrontContent />
    </LanguageProvider>
  );
}
