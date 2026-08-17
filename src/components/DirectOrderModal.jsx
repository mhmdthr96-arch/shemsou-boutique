import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  ShoppingBag,
  MessageSquare,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { createOrder } from '../lib/supabase';
import { sanitizeObject, validateOrderData, rateLimiter } from '../lib/security';

export default function DirectOrderModal({
  product,
  storeSettings,
  onClose,
  onOrderSuccess
}) {
  const { lang, t, dir } = useLanguage();

  // Multi-Image Gallery State
  const allImages = useMemo(() => {
    if (!product) return [];
    const list = [];
    if (product.cover_image) list.push(product.cover_image);
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0
      ? list
      : ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'];
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Available Colors
  const colors = useMemo(() => product?.colors || [], [product]);
  const [selectedColor, setSelectedColor] = useState(() => {
    return colors.length > 0 ? colors[0].code || colors[0].name_en : 'default';
  });

  // Dynamic Available Sizes Calculation for the Selected Color
  // RULE: Any size whose stock is 0 disappears completely from choices!
  const availableSizesForColor = useMemo(() => {
    if (!product || !product.sizes) return [];

    const variants = product.variants || [];

    return product.sizes
      .map((size) => {
        const variant = variants.find(
          (v) =>
            (v.color === selectedColor || v.color_code === selectedColor) &&
            v.size === size
        );
        const stock = variant ? Number(variant.stock) || 0 : 0;
        return {
          size,
          stock
        };
      })
      .filter((item) => item.stock > 0); // Hides out-of-stock sizes completely!
  }, [product, selectedColor]);

  // Selected Size State
  const [selectedSize, setSelectedSize] = useState('');

  // Auto-select first available size when color changes
  useEffect(() => {
    if (availableSizesForColor.length > 0) {
      setSelectedSize(availableSizesForColor[0].size);
    } else {
      setSelectedSize('');
    }
  }, [selectedColor, availableSizesForColor]);

  // Current selected variant stock
  const currentVariantStock = useMemo(() => {
    const item = availableSizesForColor.find((s) => s.size === selectedSize);
    return item ? item.stock : 0;
  }, [availableSizesForColor, selectedSize]);

  // Quantity State
  const [quantity, setQuantity] = useState(1);

  // Adjust quantity if it exceeds available stock
  useEffect(() => {
    if (currentVariantStock > 0 && quantity > currentVariantStock) {
      setQuantity(currentVariantStock);
    }
  }, [currentVariantStock, quantity]);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_wilaya: '',
    customer_address: '',
    customer_notes: '',
    hp_website_check: '' // Honeypot trap for bots
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  if (!product) return null;

  const title =
    lang === 'ar'
      ? product.title_ar
      : lang === 'fr'
      ? product.title_fr || product.title_ar
      : product.title_en || product.title_ar;

  const description =
    lang === 'ar'
      ? product.description_ar
      : lang === 'fr'
      ? product.description_fr || product.description_ar
      : product.description_en || product.description_ar;

  const unitPrice = Number(product.price) || 0;
  const totalPrice = unitPrice * quantity;

  // Wilaya-based delivery fee
  const wilayasList = storeSettings?.wilayas || [];
  const selectedWilaya = wilayasList.find((w) => w.name === formData.customer_wilaya);
  const deliveryFee = selectedWilaya ? Number(selectedWilaya.delivery_fee) || 0 : 0;
  const totalWithDelivery = totalPrice + deliveryFee;

  // Selected Color Details
  const selectedColorObj = colors.find(
    (c) => c.code === selectedColor || c.name_en === selectedColor
  );
  const selectedColorName = selectedColorObj
    ? lang === 'ar'
      ? selectedColorObj.name_ar
      : lang === 'fr'
      ? selectedColorObj.name_fr || selectedColorObj.name_ar
      : selectedColorObj.name_en || selectedColorObj.name_ar
    : selectedColor;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Direct COD Order Submission
  const handleConfirmOrder = async (e) => {
    e.preventDefault();

    // Check rate limiter
    const rateCheck = rateLimiter.canProceed();
    if (!rateCheck.allowed) {
      setFormErrors({ general: rateCheck.message });
      return;
    }

    const payload = {
      ...formData,
      product_id: product.id,
      product_title: title,
      selected_color: selectedColorName,
      selected_color_code: selectedColor,
      selected_size: selectedSize,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice
    };

    const sanitizedPayload = sanitizeObject(payload);
    const validation = validateOrderData(sanitizedPayload);

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    if (currentVariantStock < quantity) {
      setFormErrors({ general: t.outOfStockNotice });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      rateLimiter.recordAction();
      const saved = await createOrder(sanitizedPayload);
      setSubmittedOrder(saved);
      if (onOrderSuccess) onOrderSuccess(saved);
    } catch (err) {
      setFormErrors({ general: err.message || 'حدث خطأ أثناء حفظ الطلب' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct WhatsApp Order Generator
  const handleWhatsAppOrder = () => {
    const rateCheck = rateLimiter.canProceed();
    if (!rateCheck.allowed) {
      setFormErrors({ general: rateCheck.message });
      return;
    }

    const sanitized = sanitizeObject(formData);
    const validation = validateOrderData({
      ...sanitized,
      selected_color: selectedColorName,
      selected_size: selectedSize,
      quantity
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    const wpNumber = storeSettings?.whatsapp_number || '213555000000';

    const message = `⚜️ *طلب جديد من SHEMSOU BOUTIQUE* ⚜️
-----------------------------------
👠 *المنتج:* ${title}
🎨 *اللون المختار:* ${selectedColorName}
📏 *المقاس:* ${selectedSize}
🔢 *الكمية:* ${quantity}
💰 *السعر الإجمالي:* ${totalPrice.toLocaleString()} ${t.currency}
${selectedWilaya ? `🚚 *سعر التوصيل (${selectedWilaya.name}):* ${deliveryFee.toLocaleString()} ${t.currency}` : ''}
💎 *الإجمالي مع التوصيل:* ${totalWithDelivery.toLocaleString()} ${t.currency}
-----------------------------------
👤 *اسم الزبون:* ${sanitized.customer_name}
📞 *رقم الهاتف:* ${sanitized.customer_phone}
📍 *الولاية / المدينة:* ${sanitized.customer_wilaya}
🏠 *العنوان:* ${sanitized.customer_address}
${sanitized.customer_notes ? `📝 *ملاحظات:* ${sanitized.customer_notes}` : ''}
-----------------------------------
يرجى تأكيد استلام الطلب وتحديد موعد التوصيل. شكراً لكم!`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${wpNumber}?text=${encoded}`;
    window.open(url, '_blank');

    // Also register order in backend
    createOrder({
      ...sanitized,
      product_id: product.id,
      product_title: title,
      selected_color: selectedColorName,
      selected_size: selectedSize,
      quantity,
      unit_price: unitPrice,
      delivery_fee: deliveryFee,
      total_price: totalWithDelivery,
      source: 'whatsapp'
    }).catch(console.error);

    setSubmittedOrder({ order_number: `WP-${Date.now().toString().slice(-5)}` });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="direct-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label={t.close}
        >
          <X size={18} />
        </button>

        {submittedOrder ? (
          /* Success Screen */
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '4rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem'
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'var(--gold-gradient-soft)',
                border: '2px solid var(--gold-pure)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--gold-glow)'
              }}
            >
              <CheckCircle2 size={38} color="#D4AF37" />
            </div>

            <h2 style={{ fontSize: '1.8rem', color: 'var(--beige-silk)' }}>
              {t.orderSuccessTitle}
            </h2>

            <div
              className="gold-badge"
              style={{ fontSize: '0.95rem', padding: '0.5rem 1.25rem' }}
            >
              <span>{t.orderNumber}:</span>
              <strong>{submittedOrder.order_number}</strong>
            </div>

            <p
              style={{
                color: 'var(--beige-muted)',
                maxWidth: '520px',
                lineHeight: '1.7',
                fontSize: '0.95rem'
              }}
            >
              {t.orderSuccessDesc}
            </p>

            <button
              type="button"
              className="btn-luxury"
              style={{ marginTop: '1rem' }}
              onClick={onClose}
            >
              <span>{t.continueShopping}</span>
            </button>
          </div>
        ) : (
          <>
            {/* Left Column: Multi-Image Showcase Gallery */}
            <div className="modal-gallery-pane">
              <div className="modal-main-img-box">
                <img
                  src={allImages[activeImageIndex] || allImages[0]}
                  alt={title}
                />
              </div>

              {/* Thumbnails Row */}
              {allImages.length > 1 && (
                <div className="modal-thumbnails-row">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`modal-thumb-btn ${
                        activeImageIndex === idx ? 'active' : ''
                      }`}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img src={img} alt={`${title} ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Brief Description */}
              {description && (
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.6',
                    marginTop: '0.5rem'
                  }}
                >
                  {description}
                </div>
              )}
            </div>

            {/* Right Column: Direct Purchase Form */}
            <div className="modal-form-pane">
              <div>
                <div
                  className="gold-badge"
                  style={{ marginBottom: '0.5rem', fontSize: '0.7rem' }}
                >
                  <Sparkles size={12} color="#D4AF37" />
                  <span>SHEMSOU LUXE</span>
                </div>
                <h2
                  style={{
                    fontSize: '1.45rem',
                    color: 'var(--beige-silk)',
                    lineHeight: '1.3'
                  }}
                >
                  {title}
                </h2>
                <div
                  className="price-current"
                  style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}
                >
                  {unitPrice.toLocaleString()} {t.currency}
                </div>
              </div>

              {/* General Error Notice */}
              {formErrors.general && (
                <div className="out-of-stock-alert-box">
                  <AlertCircle size={16} />
                  <span>{formErrors.general}</span>
                </div>
              )}

              {/* 1. Color Selector */}
              {colors.length > 0 && (
                <div className="color-selector-section">
                  <label className="form-label">
                    {t.chooseColor}: <strong>{selectedColorName}</strong>
                  </label>
                  <div className="color-chips-row">
                    {colors.map((color, idx) => {
                      const cCode = color.code || color.name_en;
                      const isActive = selectedColor === cCode;
                      const cName =
                        lang === 'ar'
                          ? color.name_ar
                          : lang === 'fr'
                          ? color.name_fr || color.name_ar
                          : color.name_en || color.name_ar;

                      return (
                        <button
                          key={cCode || idx}
                          type="button"
                          className={`color-chip-btn ${isActive ? 'active' : ''}`}
                          onClick={() => setSelectedColor(cCode)}
                        >
                          <span
                            className="color-dot"
                            style={{ backgroundColor: color.hex || '#fff' }}
                          />
                          <span>{cName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Dynamic Size Selector (Hides out of stock sizes) */}
              <div className="size-selector-section">
                <label className="form-label">
                  {t.chooseSize}:{' '}
                  {selectedSize && <strong>{selectedSize}</strong>}
                </label>

                {availableSizesForColor.length > 0 ? (
                  <div className="size-chips-row">
                    {availableSizesForColor.map((item) => {
                      const isActive = selectedSize === item.size;
                      return (
                        <button
                          key={item.size}
                          type="button"
                          className={`size-chip-btn ${isActive ? 'active' : ''}`}
                          onClick={() => setSelectedSize(item.size)}
                        >
                          {item.size}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* If all sizes for this color are out of stock */
                  <div className="out-of-stock-alert-box">
                    <AlertCircle size={16} />
                    <span>{t.allSizesOutOfStockNotice}</span>
                  </div>
                )}

                {/* Stock Indicator */}
                {currentVariantStock > 0 && (
                  <div className="stock-left-indicator">
                    {currentVariantStock <= 5
                      ? t.onlyFewLeft.replace('{count}', currentVariantStock)
                      : `${t.inStock} (${currentVariantStock})`}
                  </div>
                )}
                {formErrors.selected_size && (
                  <span className="form-error-msg">{formErrors.selected_size}</span>
                )}
              </div>

              {/* 3. Quantity & Pricing */}
              {availableSizesForColor.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="qty-counter-row">
                    <span className="form-label">{t.quantity}:</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    >
                      -
                    </button>
                    <span className="qty-val-display">{quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() =>
                        setQuantity((prev) =>
                          Math.min(currentVariantStock || 99, prev + 1)
                        )
                      }
                      disabled={quantity >= currentVariantStock}
                    >
                      +
                    </button>
                  </div>

                  <div style={{ textAlign: 'end' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                      {t.totalPrice}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--beige-silk)' }}>
                      {totalPrice.toLocaleString()} {t.currency}
                    </div>
                    {selectedWilaya && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        سعر التوصيل ({selectedWilaya.name}): {deliveryFee.toLocaleString()} {t.currency}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        color: 'var(--gold-light)',
                        marginTop: '0.3rem'
                      }}
                    >
                      {t.totalWithDelivery || 'الإجمالي مع التوصيل'}: {totalWithDelivery.toLocaleString()} {t.currency}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Customer Delivery Details Form */}
              <div className="order-form-grid">
                {/* Honeypot hidden trap input (Anti-bot) */}
                <input
                  type="text"
                  name="hp_website_check"
                  value={formData.hp_website_check}
                  onChange={handleInputChange}
                  style={{ display: 'none' }}
                  tabIndex="-1"
                  autoComplete="off"
                />

                <div className="form-group">
                  <label className="form-label">{t.fullName} *</label>
                  <input
                    type="text"
                    name="customer_name"
                    className="form-input"
                    placeholder={t.fullNamePlaceholder}
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.customer_name && (
                    <span className="form-error-msg">{formErrors.customer_name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">{t.phone} *</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    className="form-input"
                    placeholder={t.phonePlaceholder}
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.customer_phone && (
                    <span className="form-error-msg">{formErrors.customer_phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">{t.wilaya} *</label>
                  {wilayasList.length > 0 ? (
                    <select
                      name="customer_wilaya"
                      className="form-input"
                      value={formData.customer_wilaya}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">{t.wilayaPlaceholder}</option>
                      {wilayasList.map((w) => (
                        <option key={w.name} value={w.name}>
                          {w.name} — {Number(w.delivery_fee) || 0} {t.currency}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="customer_wilaya"
                      className="form-input"
                      placeholder={t.wilayaPlaceholder}
                      value={formData.customer_wilaya}
                      onChange={handleInputChange}
                      required
                    />
                  )}
                  {formErrors.customer_wilaya && (
                    <span className="form-error-msg">{formErrors.customer_wilaya}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">{t.address} *</label>
                  <input
                    type="text"
                    name="customer_address"
                    className="form-input"
                    placeholder={t.addressPlaceholder}
                    value={formData.customer_address}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.customer_address && (
                    <span className="form-error-msg">{formErrors.customer_address}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">{t.notes}</label>
                  <input
                    type="text"
                    name="customer_notes"
                    className="form-input"
                    placeholder={t.notesPlaceholder}
                    value={formData.customer_notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Action Buttons: Confirm COD or Direct WhatsApp */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginTop: '0.5rem'
                }}
              >
                <button
                  type="button"
                  className="btn-luxury"
                  style={{ width: '100%', padding: '0.9rem' }}
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting || availableSizesForColor.length === 0}
                >
                  <ShoppingBag size={18} />
                  <span>{isSubmitting ? t.orderProcessing : t.confirmOrderCOD}</span>
                </button>

                <button
                  type="button"
                  className="btn-whatsapp"
                  style={{ width: '100%', padding: '0.85rem' }}
                  onClick={handleWhatsAppOrder}
                  disabled={availableSizesForColor.length === 0}
                >
                  <MessageSquare size={18} />
                  <span>{t.orderViaWhatsApp}</span>
                </button>
              </div>

              {/* Trust Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)'
                }}
              >
                <ShieldCheck size={15} color="#D4AF37" />
                <span>{t.feature3Desc}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
