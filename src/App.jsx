import React, { useState, useEffect, useMemo } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import AnnouncementBar from './components/AnnouncementBar';
import Header from './components/Header';
import StoryReel from './components/StoryReel';
import StoryViewerModal from './components/StoryViewerModal';
import HeroBanner from './components/HeroBanner';
import CategoryNav from './components/CategoryNav';
import SearchAndFilters from './components/SearchAndFilters';
import ProductGrid from './components/ProductGrid';
import DirectOrderModal from './components/DirectOrderModal';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import {
  getProducts,
  getCategories,
  getStories,
  getStoreSettings
} from './lib/supabase';

function StorefrontContent() {
  const { lang } = useLanguage();

  // Core Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stories, setStories] = useState([]);
  const [storeSettings, setStoreSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Modals
  const [activeOrderProduct, setActiveOrderProduct] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Load Data on Mount
  const loadData = async () => {
    try {
      const [prods, cats, stors, settings] = await Promise.all([
        getProducts(),
        getCategories(),
        getStories(),
        getStoreSettings()
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
      setStories(stors || []);
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
        // Category filter
        if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
          return false;
        }

        // Search term filter
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
        // Default: featured first
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchTerm, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
  };

  const handleSearchFocus = () => {
    const el = document.getElementById('catalog-controls');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const input = el.querySelector('input');
      if (input) input.focus();
    }
  };

  return (
    <div className="store-wrapper">
      {/* Top Announcement Bar */}
      <AnnouncementBar storeSettings={storeSettings} />

      {/* Main Luxury Header with Central Avatar Logo (IMG_3498.PNG) */}
      <Header
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSearchClick={handleSearchFocus}
      />

      {/* Connected Admin Stories & Reels Bar */}
      <StoryReel
        stories={stories}
        onSelectStory={(index) => setActiveStoryIndex(index)}
      />

      {/* Hero Welcome Banner */}
      <HeroBanner
        onExploreClick={() => {
          const el = document.getElementById('main-catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
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
            loadData(); // Reload stock counters
          }}
        />
      )}

      {/* Cinematic Fullscreen Story Viewer */}
      {activeStoryIndex !== null && (
        <StoryViewerModal
          stories={stories}
          initialIndex={activeStoryIndex}
          products={products}
          onClose={() => setActiveStoryIndex(null)}
          onOpenProductOrder={(product) => {
            setActiveStoryIndex(null);
            setActiveOrderProduct(product);
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
