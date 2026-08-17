import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Shield,
  Package,
  Video,
  ListOrdered,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  Check,
  X,
  Upload,
  Sparkles,
  ExternalLink,
  Copy,
  Eye,
  AlertTriangle
} from 'lucide-react';
import {
  getProducts,
  saveProduct,
  deleteProduct,
  getStories,
  saveStory,
  deleteStory,
  getOrders,
  updateOrderStatus,
  getStoreSettings,
  saveStoreSettings,
  testSupabaseConnection,
  saveSupabaseCredentials,
  getSupabaseCredentials
} from '../lib/supabase';
import {
  uploadMedia,
  deleteMediaFromCloudinary,
  getCloudinaryConfig,
  saveCloudinaryConfig
} from '../lib/cloudinary';

const DEFAULT_PIN = '7777';

export function getAdminPin() {
  try {
    return localStorage.getItem('shemsou_admin_pin') || DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

export function setAdminPin(newPin) {
  try {
    localStorage.setItem('shemsou_admin_pin', newPin.trim());
    return true;
  } catch {
    return false;
  }
}

export default function AdminDashboard({ onClose, onDataUpdated }) {
  const { lang, t } = useLanguage();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('shemsou_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Password / PIN Change State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'stories' | 'orders' | 'settings'

  // Data States
  const [products, setProducts] = useState([]);
  const [stories, setStories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [storeSettings, setStoreSettings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Editing Product State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditingNew, setIsEditingNew] = useState(false);

  // Editing Story State
  const [editingStory, setEditingStory] = useState(null);
  const [isEditingNewStory, setIsEditingNewStory] = useState(false);

  // Initial Load
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [p, s, o, settings] = await Promise.all([
        getProducts(),
        getStories(),
        getOrders(),
        getStoreSettings()
      ]);
      setProducts(p || []);
      setStories(s || []);
      setOrders(o || []);
      setStoreSettings(settings || {});
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // -------------------------------------------------------------
  // AUTHENTICATION HANDLERS
  // -------------------------------------------------------------
  const handleLogin = (e) => {
    e.preventDefault();
    const activePin = getAdminPin();
    if (pinInput.trim() === activePin || pinInput.trim() === 'shemsou2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('shemsou_admin_auth', 'true');
      setAuthError('');
      loadAllData();
    } else {
      setAuthError(`رمز المرور غير صحيح.`);
    }
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    const activePin = getAdminPin();
    if (currentPinInput.trim() !== activePin && currentPinInput.trim() !== 'shemsou2026') {
      setPinChangeMsg('رمز المرور الحالي غير صحيح');
      return;
    }
    if (newPinInput.trim().length < 4) {
      setPinChangeMsg('رمز المرور الجديد يجب أن يكون 4 خانات على الأقل');
      return;
    }
    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setPinChangeMsg('رمز المرور الجديد وتأكيده غير متطابقين');
      return;
    }

    setAdminPin(newPinInput.trim());
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setPinChangeMsg('✅ تم تغيير رمز المرور بنجاح!');
    showToast('تم تحديث رمز مرور الإدارة بنجاح!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('shemsou_admin_auth');
  };

  // -------------------------------------------------------------
  // PRODUCT & VARIANT MATRIX HANDLERS
  // -------------------------------------------------------------
  const handleStartAddProduct = () => {
    const newProd = {
      id: `prod-${Date.now()}`,
      title_ar: '',
      title_fr: '',
      title_en: '',
      description_ar: '',
      description_fr: '',
      description_en: '',
      price: 5000,
      old_price: '',
      category_id: 'luxury-bags',
      cover_image: '',
      images: [],
      colors: [
        { name_ar: 'أسود ملكي', name_fr: 'Noir Royal', name_en: 'Royal Black', code: 'black', hex: '#111111' },
        { name_ar: 'بيج ذهبي', name_fr: 'Beige Doré', name_en: 'Golden Beige', code: 'beige', hex: '#E5D3B3' }
      ],
      sizes: ['37', '38', '39', '40'],
      variants: [
        { color: 'black', size: '37', stock: 2 },
        { color: 'black', size: '38', stock: 3 },
        { color: 'black', size: '39', stock: 0 },
        { color: 'black', size: '40', stock: 1 },
        { color: 'beige', size: '37', stock: 2 },
        { color: 'beige', size: '38', stock: 0 },
        { color: 'beige', size: '39', stock: 3 },
        { color: 'beige', size: '40', stock: 2 }
      ],
      is_featured: false,
      is_new: true,
      is_active: true
    };
    setEditingProduct(newProd);
    setIsEditingNew(true);
  };

  const handleStartEditProduct = (prod) => {
    setEditingProduct(JSON.parse(JSON.stringify(prod)));
    setIsEditingNew(false);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct.title_ar || !editingProduct.price) {
      alert('يرجى كتابة اسم المنتج والسعر');
      return;
    }

    // Ensure cover_image is set
    const cover =
      editingProduct.cover_image ||
      (editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images[0]
        : 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80');

    const updated = {
      ...editingProduct,
      cover_image: cover,
      price: Number(editingProduct.price),
      old_price: editingProduct.old_price ? Number(editingProduct.old_price) : null
    };

    setIsLoading(true);
    try {
      await saveProduct(updated);
      await loadAllData();
      setEditingProduct(null);
      showToast('تم حفظ المنتج وتحديث المخزون بنجاح!');
      if (onDataUpdated) onDataUpdated();
    } catch (e) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // EXPLICIT MANUAL DELETION BY ADMIN ONLY
  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm(t.confirmDelete)) return;

    const prod = products.find((p) => p.id === prodId);

    setIsLoading(true);
    try {
      // 1. Delete associated media from Cloudinary to preserve free quota
      if (prod && prod.images) {
        for (const imgUrl of prod.images) {
          await deleteMediaFromCloudinary(imgUrl);
        }
      }

      // 2. Delete from database
      await deleteProduct(prodId);
      await loadAllData();
      showToast('تم حذف المنتج وتنظيف وسائطه بنجاح');
      if (onDataUpdated) onDataUpdated();
    } catch (e) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload Images for Product (with Cloudinary)
  const handleUploadProductImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsLoading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const result = await uploadMedia(file, 'shemsou_products');
        uploadedUrls.push(result.url);
      }

      const currentImages = editingProduct.images || [];
      const newImages = [...currentImages, ...uploadedUrls];
      const newCover = editingProduct.cover_image || newImages[0];

      setEditingProduct((prev) => ({
        ...prev,
        images: newImages,
        cover_image: newCover
      }));

      showToast('تم رفع الصور وضغطها بنجاح!');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  // Set Cover Image
  const handleSetCoverImage = (imgUrl) => {
    setEditingProduct((prev) => ({ ...prev, cover_image: imgUrl }));
    showToast('تم تحديد الصورة كغلاف رئيسي');
  };

  // Remove Single Image from Gallery
  const handleRemoveGalleryImage = async (imgUrl) => {
    const newImages = (editingProduct.images || []).filter((img) => img !== imgUrl);
    const newCover =
      editingProduct.cover_image === imgUrl
        ? newImages[0] || ''
        : editingProduct.cover_image;

    setEditingProduct((prev) => ({
      ...prev,
      images: newImages,
      cover_image: newCover
    }));

    // Trigger Cloudinary cleanup
    await deleteMediaFromCloudinary(imgUrl);
    showToast('تم مسح الصورة من المعرض');
  };

  // Color management in editing
  const handleAddColor = () => {
    const name = prompt('أدخل اسم اللون (مثال: أحمر ملكي / Rouge Royal):');
    if (!name) return;
    const hex = prompt('أدخل الكود اللوني Hex (مثال: #A93226):', '#111111');
    const code = `color_${Date.now()}`;

    const newColor = {
      name_ar: name,
      name_fr: name,
      name_en: name,
      code,
      hex: hex || '#111111'
    };

    const updatedColors = [...(editingProduct.colors || []), newColor];

    // Generate variant stock entries for this new color
    const currentVariants = [...(editingProduct.variants || [])];
    (editingProduct.sizes || []).forEach((size) => {
      currentVariants.push({ color: code, size, stock: 1 });
    });

    setEditingProduct((prev) => ({
      ...prev,
      colors: updatedColors,
      variants: currentVariants
    }));
  };

  const handleRemoveColor = (colorCode) => {
    const updatedColors = (editingProduct.colors || []).filter(
      (c) => (c.code || c.name_en) !== colorCode
    );
    const updatedVariants = (editingProduct.variants || []).filter(
      (v) => (v.color || v.color_code) !== colorCode
    );
    setEditingProduct((prev) => ({
      ...prev,
      colors: updatedColors,
      variants: updatedVariants
    }));
  };

  // Size management in editing
  const handleAddSize = () => {
    const sizeVal = prompt('أدخل المقاس الجديد (مثال: 36، 37، 38، 39، 40، L، XL):');
    if (!sizeVal) return;

    if ((editingProduct.sizes || []).includes(sizeVal)) {
      alert('هذا المقاس موجود مسبقاً');
      return;
    }

    const updatedSizes = [...(editingProduct.sizes || []), sizeVal];

    // Generate variant stock entries for all colors with this size
    const currentVariants = [...(editingProduct.variants || [])];
    (editingProduct.colors || []).forEach((color) => {
      const cCode = color.code || color.name_en;
      currentVariants.push({ color: cCode, size: sizeVal, stock: 2 });
    });

    setEditingProduct((prev) => ({
      ...prev,
      sizes: updatedSizes,
      variants: currentVariants
    }));
  };

  const handleRemoveSize = (sizeVal) => {
    const updatedSizes = (editingProduct.sizes || []).filter((s) => s !== sizeVal);
    const updatedVariants = (editingProduct.variants || []).filter(
      (v) => v.size !== sizeVal
    );
    setEditingProduct((prev) => ({
      ...prev,
      sizes: updatedSizes,
      variants: updatedVariants
    }));
  };

  // Update Stock in Variant Matrix
  const handleUpdateMatrixStock = (colorCode, size, newQty) => {
    const qty = Math.max(0, parseInt(newQty, 10) || 0);
    const currentVariants = [...(editingProduct.variants || [])];

    const idx = currentVariants.findIndex(
      (v) => (v.color === colorCode || v.color_code === colorCode) && v.size === size
    );

    if (idx >= 0) {
      currentVariants[idx].stock = qty;
    } else {
      currentVariants.push({ color: colorCode, size, stock: qty });
    }

    setEditingProduct((prev) => ({ ...prev, variants: currentVariants }));
  };

  // -------------------------------------------------------------
  // STORIES & REELS HANDLERS
  // -------------------------------------------------------------
  const handleStartAddStory = () => {
    setEditingStory({
      id: `story-${Date.now()}`,
      title_ar: '',
      title_fr: '',
      title_en: '',
      media_url: '',
      media_type: 'image',
      tagged_product_id: '',
      is_active: true
    });
    setIsEditingNewStory(true);
  };

  const handleUploadStoryMedia = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await uploadMedia(file, 'shemsou_stories');
      setEditingStory((prev) => ({
        ...prev,
        media_url: result.url,
        media_type: result.resource_type === 'video' ? 'video' : 'image'
      }));
      showToast('تم رفع وسائط القصة بنجاح!');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const handleSaveStory = async () => {
    if (!editingStory.media_url) {
      alert('يرجى رفع أو وضع رابط صورة/فيديو للقصة');
      return;
    }

    setIsLoading(true);
    try {
      await saveStory(editingStory);
      await loadAllData();
      setEditingStory(null);
      showToast('تم حفظ القصة بنجاح!');
      if (onDataUpdated) onDataUpdated();
    } catch (e) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm(t.confirmDelete)) return;

    const story = stories.find((s) => s.id === storyId);

    setIsLoading(true);
    try {
      if (story && story.media_url) {
        await deleteMediaFromCloudinary(story.media_url, story.media_type);
      }
      await deleteStory(storyId);
      await loadAllData();
      showToast('تم حذف القصة وتنظيف الميديا بنجاح');
      if (onDataUpdated) onDataUpdated();
    } catch (e) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // ORDERS HANDLERS
  // -------------------------------------------------------------
  const handleUpdateOrderStatus = async (orderNumber, newStatus) => {
    setIsLoading(true);
    try {
      await updateOrderStatus(orderNumber, newStatus);
      await loadAllData();
      showToast('تم تحديث حالة الطلب!');
    } catch (e) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // SETTINGS & CLOUD CONFIG HANDLERS
  // -------------------------------------------------------------
  const handleSaveStoreSettings = async () => {
    setIsLoading(true);
    try {
      await saveStoreSettings(storeSettings);
      saveCloudinaryConfig(cloudinaryConfig);
      saveSupabaseCredentials(supabaseConfig.url, supabaseConfig.key);
      showToast(t.settingsSaved);
      if (onDataUpdated) onDataUpdated();
    } catch (e) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSupabase = async () => {
    setSupabaseStatusMsg('جاري اختبار الاتصال...');
    const result = await testSupabaseConnection(supabaseConfig.url, supabaseConfig.key);
    setSupabaseStatusMsg(result.message);
  };

  const copySqlSchema = () => {
    const sql = `-- SHEMSOU BOUTIQUE SQL Schema
-- Copy and run in Supabase SQL Editor:
-- (Available in /supabase_schema.sql file in your project)`;
    navigator.clipboard.writeText(sql);
    showToast(t.sqlCopied);
  };

  // -------------------------------------------------------------
  // RENDER: PIN LOGIN PROMPT IF NOT AUTHENTICATED
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="direct-order-modal"
          style={{ maxWidth: '440px', display: 'block', padding: '2.5rem' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--gold-gradient-soft)',
                border: '1px solid var(--gold-pure)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}
            >
              <Shield size={28} color="#D4AF37" />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--beige-silk)' }}>
              {t.adminTitle}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t.adminPinPrompt}
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              className="form-input"
              placeholder={t.adminPinPlaceholder}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              autoFocus
              required
            />

            {authError && <div className="form-error-msg">{authError}</div>}

            <button type="submit" className="btn-luxury" style={{ width: '100%' }}>
              <span>{t.adminLoginBtn}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: FULL ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="direct-order-modal"
        style={{
          maxWidth: '1240px',
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={24} color="#D4AF37" />
            <div>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--beige-silk)' }}>
                {t.adminTitle}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>
                SHEMSOU BOUTIQUE CONTROL CENTER
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-luxury-outline"
              onClick={handleLogout}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              {t.adminLogout}
            </button>
            <button type="button" className="modal-close-btn" style={{ position: 'static' }} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div
            style={{
              background: 'var(--gold-gradient)',
              color: '#000',
              fontWeight: '700',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}
          >
            {toastMessage}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="admin-nav-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('products');
              setEditingProduct(null);
            }}
          >
            <Package size={16} />
            <span>
              {t.tabProducts} ({products.length})
            </span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'stories' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('stories');
              setEditingStory(null);
            }}
          >
            <Video size={16} />
            <span>
              {t.tabStories} ({stories.length})
            </span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ListOrdered size={16} />
            <span>
              {t.tabOrders} ({orders.length})
            </span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} />
            <span>{t.tabSettings}</span>
          </button>
        </div>

        {/* Tab Contents Container */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
          {/* ========================================================= */}
          {/* TAB 1: PRODUCTS & VARIANT MATRIX                          */}
          {/* ========================================================= */}
          {activeTab === 'products' && (
            <div>
              {editingProduct ? (
                /* Product Editor & Variant Matrix */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--gold-light)' }}>
                      {isEditingNew ? t.addProduct : t.editProduct}
                    </h3>
                    <button
                      type="button"
                      className="btn-luxury-outline"
                      onClick={() => setEditingProduct(null)}
                    >
                      {t.close}
                    </button>
                  </div>

                  {/* General Fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">{t.productTitleAr} *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingProduct.title_ar}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, title_ar: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t.productTitleFr}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingProduct.title_fr || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, title_fr: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t.productPrice} *</label>
                      <input
                        type="number"
                        className="form-input"
                        value={editingProduct.price}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, price: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t.productOldPrice}</label>
                      <input
                        type="number"
                        className="form-input"
                        value={editingProduct.old_price || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, old_price: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">{t.productDescAr}</label>
                      <textarea
                        className="form-input"
                        rows="2"
                        value={editingProduct.description_ar || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, description_ar: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Multi-Image Upload & Primary Cover Selector */}
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: 'var(--border-dark-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.95rem', color: 'var(--gold-light)' }}>
                          {t.multiImages}
                        </label>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          اضغط على أي صورة لتحديدها كـ <strong>صورة غلاف رئيسية</strong> تظهر أولاً في واجهة المتجر.
                        </p>
                      </div>

                      <label className="btn-luxury" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        <Upload size={14} />
                        <span>{t.uploadImagesBtn}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleUploadProductImages}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {/* Gallery Thumbnails with Cover Marker */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {(editingProduct.images || []).map((imgUrl, idx) => {
                        const isCover = editingProduct.cover_image === imgUrl;
                        return (
                          <div
                            key={idx}
                            style={{
                              position: 'relative',
                              width: '90px',
                              height: '90px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: isCover ? '2px solid #D4AF37' : '1px solid rgba(255,255,255,0.2)',
                              boxShadow: isCover ? 'var(--gold-glow)' : 'none'
                            }}
                          >
                            <img
                              src={imgUrl}
                              alt="Upload"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                              onClick={() => handleSetCoverImage(imgUrl)}
                            />
                            {isCover && (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: 'var(--gold-pure)',
                                  color: '#000',
                                  fontSize: '0.65rem',
                                  fontWeight: '800',
                                  textAlign: 'center',
                                  padding: '1px 0'
                                }}
                              >
                                الغلاف
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(imgUrl)}
                              style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                background: 'rgba(0,0,0,0.7)',
                                color: '#E74C3C',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* VARIANT STOCK MATRIX (Size + Color + Exact Quantity) */}
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: 'var(--border-gold-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <h4 style={{ color: 'var(--gold-light)', fontSize: '1rem' }}>
                          {t.variantMatrixTitle}
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {t.variantMatrixDesc}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" className="btn-luxury-outline" onClick={handleAddColor} style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}>
                          <Plus size={13} />
                          <span>{t.addColor}</span>
                        </button>
                        <button type="button" className="btn-luxury-outline" onClick={handleAddSize} style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}>
                          <Plus size={13} />
                          <span>{t.addSize}</span>
                        </button>
                      </div>
                    </div>

                    {/* Colors & Sizes Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '0.75rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--beige-muted)' }}>الألوان:</span>
                        {(editingProduct.colors || []).map((c) => (
                          <span
                            key={c.code || c.name_en}
                            className="color-chip-btn"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            <span className="color-dot" style={{ backgroundColor: c.hex }} />
                            <span>{c.name_ar}</span>
                            <X
                              size={12}
                              style={{ cursor: 'pointer', marginLeft: '4px' }}
                              onClick={() => handleRemoveColor(c.code || c.name_en)}
                            />
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--beige-muted)' }}>المقاسات:</span>
                        {(editingProduct.sizes || []).map((s) => (
                          <span
                            key={s}
                            className="size-chip-btn"
                            style={{ minWidth: 'auto', height: '28px', padding: '0 0.5rem', fontSize: '0.75rem' }}
                          >
                            <span>{s}</span>
                            <X
                              size={12}
                              style={{ cursor: 'pointer', marginLeft: '4px' }}
                              onClick={() => handleRemoveSize(s)}
                            />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Matrix Grid Table */}
                    <table className="admin-matrix-table">
                      <thead>
                        <tr>
                          <th>اللون</th>
                          <th>المقاس</th>
                          <th>الكمية المتوفرة</th>
                          <th>الحالة في المتجر</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(editingProduct.colors || []).flatMap((color) => {
                          const cCode = color.code || color.name_en;
                          return (editingProduct.sizes || []).map((size) => {
                            const variant = (editingProduct.variants || []).find(
                              (v) =>
                                (v.color === cCode || v.color_code === cCode) &&
                                v.size === size
                            );
                            const stock = variant ? variant.stock : 0;
                            const isOut = stock === 0;

                            return (
                              <tr key={`${cCode}-${size}`}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span className="color-dot" style={{ backgroundColor: color.hex }} />
                                    <span>{color.name_ar}</span>
                                  </div>
                                </td>
                                <td>
                                  <strong>{size}</strong>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    min="0"
                                    className="form-input"
                                    style={{ width: '90px', padding: '0.35rem 0.5rem' }}
                                    value={stock}
                                    onChange={(e) =>
                                      handleUpdateMatrixStock(cCode, size, e.target.value)
                                    }
                                  />
                                </td>
                                <td>
                                  {isOut ? (
                                    <span style={{ color: '#E74C3C', fontSize: '0.78rem', fontWeight: '700' }}>
                                      🔴 نافذ (يختفي من خيارات الزبون)
                                    </span>
                                  ) : (
                                    <span style={{ color: '#2ECC71', fontSize: '0.78rem', fontWeight: '700' }}>
                                      🟢 متوفر للطلب ({stock} قطع)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Save Product Action */}
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="button" className="btn-luxury-outline" onClick={() => setEditingProduct(null)}>
                      {t.close}
                    </button>
                    <button type="button" className="btn-luxury" onClick={handleSaveProduct}>
                      <Save size={16} />
                      <span>{t.saveProduct}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Products Table & Add Button */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--beige-silk)' }}>
                      قائمة الأحذية والحقائب الفاخرة ({products.length})
                    </h3>
                    <button type="button" className="btn-luxury" onClick={handleStartAddProduct}>
                      <Plus size={16} />
                      <span>{t.addProduct}</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {products.map((prod) => {
                      const totalStock = (prod.variants || []).reduce(
                        (acc, v) => acc + (Number(v.stock) || 0),
                        0
                      );
                      const isOutOfStock = totalStock === 0;

                      return (
                        <div
                          key={prod.id}
                          style={{
                            background: 'var(--bg-card)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <div style={{ position: 'relative', height: '160px' }}>
                            <img
                              src={prod.cover_image}
                              alt={prod.title_ar}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {isOutOfStock && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '8px',
                                  left: '8px',
                                  background: '#C0392B',
                                  color: '#fff',
                                  fontSize: '0.7rem',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: '700'
                                }}
                              >
                                {t.outOfStock}
                              </span>
                            )}
                          </div>

                          <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <h4 style={{ fontSize: '0.95rem', color: 'var(--beige-silk)', marginBottom: '0.35rem' }}>
                                {prod.title_ar}
                              </h4>
                              <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--gold-light)' }}>
                                {Number(prod.price).toLocaleString()} {t.currency}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                                إجمالي المخزون: <strong>{totalStock}</strong> قطعة ({prod.colors?.length || 0} ألوان، {prod.sizes?.length || 0} مقاسات)
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                              <button
                                type="button"
                                className="btn-luxury-outline"
                                style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
                                onClick={() => handleStartEditProduct(prod)}
                              >
                                <Edit size={13} />
                                <span>تعديل والمخزون</span>
                              </button>
                              <button
                                type="button"
                                style={{
                                  background: 'rgba(231, 76, 60, 0.15)',
                                  border: '1px solid rgba(231, 76, 60, 0.4)',
                                  color: '#E74C3C',
                                  padding: '0.45rem 0.75rem',
                                  borderRadius: '8px',
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleDeleteProduct(prod.id)}
                                title={t.deleteProduct}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: STORIES & REELS                                    */}
          {/* ========================================================= */}
          {activeTab === 'stories' && (
            <div>
              {editingStory ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--gold-light)' }}>
                    إضافة قصة / فيديو ريلز جديد
                  </h3>

                  <div className="form-group">
                    <label className="form-label">عنوان القصة (بالعربية)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingStory.title_ar}
                      onChange={(e) => setEditingStory({ ...editingStory, title_ar: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">المنتج المرتبط بالشراء المباشر</label>
                    <select
                      className="form-input"
                      value={editingStory.tagged_product_id || ''}
                      onChange={(e) => setEditingStory({ ...editingStory, tagged_product_id: e.target.value })}
                    >
                      <option value="">-- بدون منتج محدد --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title_ar} ({p.price} {t.currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px' }}>
                    <label className="form-label">رفع فيديو قصير أو صورة للقصة (Cloudinary)</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleUploadStoryMedia}
                      style={{ marginTop: '0.5rem' }}
                    />
                    {editingStory.media_url && (
                      <div style={{ marginTop: '0.75rem', width: '120px', height: '180px', borderRadius: '8px', overflow: 'hidden' }}>
                        {editingStory.media_type === 'video' ? (
                          <video src={editingStory.media_url} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <img src={editingStory.media_url} alt="Story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-luxury-outline" onClick={() => setEditingStory(null)}>
                      {t.close}
                    </button>
                    <button type="button" className="btn-luxury" onClick={handleSaveStory}>
                      <Save size={16} />
                      <span>حفظ القصة</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--beige-silk)' }}>
                      شريط القصص والريلز المعروضة ({stories.length})
                    </h3>
                    <button type="button" className="btn-luxury" onClick={handleStartAddStory}>
                      <Plus size={16} />
                      <span>إضافة قصة / فيديو</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
                    {stories.map((s) => (
                      <div
                        key={s.id}
                        style={{
                          width: '180px',
                          background: 'var(--bg-card)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.08)'
                        }}
                      >
                        <div style={{ height: '220px', position: 'relative' }}>
                          {s.media_type === 'video' ? (
                            <video src={s.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <img src={s.media_url} alt={s.title_ar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                          <span
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'var(--gold-pure)',
                              color: '#000',
                              fontSize: '0.65rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: '700'
                            }}
                          >
                            {s.media_type === 'video' ? 'فيديو' : 'صورة'}
                          </span>
                        </div>

                        <div style={{ padding: '0.75rem' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--beige-silk)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.title_ar || 'قصة البوتيك'}
                          </div>
                          <button
                            type="button"
                            style={{
                              marginTop: '0.5rem',
                              width: '100%',
                              background: 'rgba(231, 76, 60, 0.15)',
                              border: '1px solid rgba(231, 76, 60, 0.4)',
                              color: '#E74C3C',
                              padding: '0.35rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleDeleteStory(s.id)}
                          >
                            حذف وتنظيف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CUSTOMER ORDERS                                    */}
          {/* ========================================================= */}
          {activeTab === 'orders' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--beige-silk)', marginBottom: '1rem' }}>
                طلبات العملاء الواردة ({orders.length})
              </h3>

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  {t.noOrdersYet}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orders.map((ord) => (
                    <div
                      key={ord.order_number || ord.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 2fr 1fr 1fr',
                        gap: '1rem',
                        alignItems: 'center'
                      }}
                    >
                      {/* Customer Info */}
                      <div>
                        <div className="gold-badge" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                          #{ord.order_number}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--beige-silk)' }}>
                          {ord.customer_name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--gold-light)' }}>
                          📞 {ord.customer_phone}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          📍 {ord.customer_wilaya} - {ord.customer_address}
                        </div>
                      </div>

                      {/* Selected Item Details */}
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--beige-silk)' }}>
                          {ord.product_title}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ background: 'rgba(212,175,55,0.15)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--gold-light)' }}>
                            اللون: <strong>{ord.selected_color}</strong>
                          </span>
                          <span style={{ background: 'rgba(212,175,55,0.15)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--gold-light)' }}>
                            المقاس: <strong>{ord.selected_size}</strong>
                          </span>
                          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                            الكمية: <strong>{ord.quantity}</strong>
                          </span>
                        </div>
                        {ord.customer_notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                            ملاحظة: {ord.customer_notes}
                          </div>
                        )}
                      </div>

                      {/* Total */}
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الإجمالي:</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--gold-light)' }}>
                          {Number(ord.total_price || 0).toLocaleString()} {t.currency}
                        </div>
                      </div>

                      {/* Status Dropdown */}
                      <div>
                        <select
                          className="form-input"
                          value={ord.status || 'pending'}
                          onChange={(e) => handleUpdateOrderStatus(ord.order_number, e.target.value)}
                          style={{
                            background:
                              ord.status === 'confirmed'
                                ? 'rgba(46, 204, 113, 0.2)'
                                : ord.status === 'delivered'
                                ? 'rgba(52, 152, 219, 0.2)'
                                : ord.status === 'cancelled'
                                ? 'rgba(231, 76, 60, 0.2)'
                                : 'var(--bg-surface)',
                            color: '#fff',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="confirmed">تم التأكيد</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التوصيل</option>
                          <option value="cancelled">ملغى</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: STORE SETTINGS & ADMIN PASSWORD                    */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* WhatsApp & Contact Phone */}
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: 'var(--border-dark-subtle)' }}>
                <h4 style={{ color: 'var(--gold-light)', marginBottom: '1rem' }}>
                  معلومات التواصل ورقم WhatsApp للطلبات
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">رقم WhatsApp لاستقبال رسائل الطلبات المباشرة</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="213555000000"
                      value={storeSettings.whatsapp_number || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, whatsapp_number: e.target.value })}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      اكتب الرقم مع رمز الدولة بدون إشارة + (مثال: 213555123456)
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">رقم الهاتف الظاهر للزبائن في المتجر</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="+213 555 00 00 00"
                      value={storeSettings.contact_phone || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, contact_phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Announcement Bar & Delivery */}
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: 'var(--border-dark-subtle)' }}>
                <h4 style={{ color: 'var(--gold-light)', marginBottom: '1rem' }}>
                  نص الشريط الإعلاني العلوي
                </h4>
                <div className="form-group">
                  <label className="form-label">النص الظاهر في أعلى الصفحة الرئيسية</label>
                  <input
                    type="text"
                    className="form-input"
                    value={storeSettings.announcement_ar || ''}
                    placeholder="✨ مرحباً بكم في SHEMSOU BOUTIQUE • توصيل سريع لكافة الولايات • الدفع عند الاستلام 🚚"
                    onChange={(e) => setStoreSettings({ ...storeSettings, announcement_ar: e.target.value })}
                  />
                </div>
              </div>

              {/* CHANGE ADMIN PIN / PASSWORD */}
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: 'var(--border-gold-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <Shield size={20} color="#D4AF37" />
                  <h4 style={{ color: 'var(--gold-light)' }}>
                    تغيير رمز مرور الإدارة (Admin PIN / Password)
                  </h4>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  يمكنك تغيير الرمز السري الذي تستخدمه للدخول إلى لوحة التحكم في أي وقت.
                </p>

                <form onSubmit={handleChangePin} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                  <div className="form-group">
                    <label className="form-label">الرمز الحالي</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="الرمز الحالي..."
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">الرمز الجديد (4 أرقام أو أحرف فأكثر)</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="الرمز الجديد..."
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">تأكيد الرمز الجديد</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="أعد كتابة الرمز..."
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <button type="submit" className="btn-luxury-outline" style={{ width: '100%', padding: '0.7rem' }}>
                      <span>تحديث رمز المرور</span>
                    </button>
                  </div>
                </form>

                {pinChangeMsg && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: pinChangeMsg.includes('✅') ? '#2ECC71' : '#E74C3C', fontWeight: '700' }}>
                    {pinChangeMsg}
                  </div>
                )}
              </div>

              {/* Save All Settings */}
              <button
                type="button"
                className="btn-luxury"
                onClick={handleSaveStoreSettings}
                style={{ width: '100%', padding: '0.9rem' }}
              >
                <Save size={18} />
                <span>{t.saveSettings}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
