/**
 * ⚜️ SHEMSOU BOUTIQUE - Initial Luxury Catalog & Stories Data
 * Preloaded with high-fashion shoes, luxury bags, multi-images,
 * variant matrices with exact inventory per size/color, and promotional reels.
 */

export const INITIAL_CATEGORIES = [
  { id: 'all', name_ar: 'الكل', name_fr: 'Tous', name_en: 'All', slug: 'all', icon: 'Sparkles', sort_order: 0 },
  { id: 'luxury-bags', name_ar: 'حقائب يد راقية', name_fr: 'Sacs à Main de Luxe', name_en: 'Luxury Handbags', slug: 'luxury-bags', icon: 'ShoppingBag', sort_order: 1 },
  { id: 'luxury-heels', name_ar: 'أحذية كعب ملكية', name_fr: 'Escarpins & Talons', name_en: 'Luxury Heels', slug: 'luxury-heels', icon: 'Crown', sort_order: 2 },
  { id: 'sneakers', name_ar: 'أحذية شيك وسنيكرز', name_fr: 'Baskets & Sneakers', name_en: 'Chic Sneakers', slug: 'sneakers', icon: 'Footprints', sort_order: 3 },
  { id: 'crossbody-travel', name_ar: 'حقائب كروس وسفر', name_fr: 'Sacs Bandoulière & Voyage', name_en: 'Crossbody & Travel', slug: 'crossbody-travel', icon: 'Briefcase', sort_order: 4 },
  { id: 'accessories', name_ar: 'محافظ وإكسسوارات', name_fr: 'Portefeuilles & Accessoires', name_en: 'Wallets & Accessories', slug: 'accessories', icon: 'Gem', sort_order: 5 }
];

export const INITIAL_STORIES = [
  {
    id: 'story-1',
    title_ar: 'تشكيلة الحقائب الملكية 2026',
    title_fr: 'Collection Sacs Royaux 2026',
    title_en: 'Royal Handbag Collection 2026',
    media_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    tagged_product_id: 'prod-1',
    is_active: true
  },
  {
    id: 'story-2',
    title_ar: 'كعب فيرونا الذهبي اللامع',
    title_fr: 'Escarpins Verona Or Brillant',
    title_en: 'Gleaming Gold Verona Heels',
    media_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    tagged_product_id: 'prod-2',
    is_active: true
  },
  {
    id: 'story-3',
    title_ar: 'حقيبة كلاسيك موناكو البيج',
    title_fr: 'Sac Monaco Cuir Nude',
    title_en: 'Monaco Nude Leather Bag',
    media_url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    tagged_product_id: 'prod-3',
    is_active: true
  },
  {
    id: 'story-4',
    title_ar: 'سنيكرز إير فورتي الملكي الأبيض',
    title_fr: 'Sneakers Royal White Limited',
    title_en: 'Royal White Luxe Sneakers',
    media_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    tagged_product_id: 'prod-4',
    is_active: true
  }
];

export const INITIAL_PRODUCTS = [];

export const INITIAL_STORE_SETTINGS = {
  whatsapp_number: '213555000000',
  contact_phone: '+213 555 00 00 00',
  store_email: 'contact@shemsou-boutique.com',
  delivery_fee: 600,
  free_delivery_threshold: 15000,
  announcement_ar: '✨ مرحباً بكم في SHEMSOU BOUTIQUE • توصيل سريع لكافة الولايات • الدفع عند الاستلام 🚚',
  announcement_fr: '✨ Bienvenue chez SHEMSOU BOUTIQUE • Livraison rapide • Paiement à la livraison 🚚',
  announcement_en: '✨ Welcome to SHEMSOU BOUTIQUE • Express Delivery • Cash on Delivery 🚚',
  wilayas: [
    { name: 'Adrar', delivery_fee: 600 },
    { name: 'Chlef', delivery_fee: 600 },
    { name: 'Laghouat', delivery_fee: 600 },
    { name: 'Oum El Bouaghi', delivery_fee: 600 },
    { name: 'Batna', delivery_fee: 600 },
    { name: 'Béjaïa', delivery_fee: 600 },
    { name: 'Biskra', delivery_fee: 600 },
    { name: 'Béchar', delivery_fee: 600 },
    { name: 'Blida', delivery_fee: 600 },
    { name: 'Bouira', delivery_fee: 600 },
    { name: 'Tamanrasset', delivery_fee: 600 },
    { name: 'Tébessa', delivery_fee: 600 },
    { name: 'Tlemcen', delivery_fee: 600 },
    { name: 'Tiaret', delivery_fee: 600 },
    { name: 'Tizi Ouzou', delivery_fee: 600 },
    { name: 'Alger', delivery_fee: 600 },
    { name: 'Djelfa', delivery_fee: 600 },
    { name: 'Jijel', delivery_fee: 600 },
    { name: 'Sétif', delivery_fee: 600 },
    { name: 'Saïda', delivery_fee: 600 },
    { name: 'Skikda', delivery_fee: 600 },
    { name: 'Sidi Bel Abbès', delivery_fee: 600 },
    { name: 'Annaba', delivery_fee: 600 },
    { name: 'Guelma', delivery_fee: 600 },
    { name: 'Constantine', delivery_fee: 600 },
    { name: 'Médéa', delivery_fee: 600 },
    { name: 'Mostaganem', delivery_fee: 600 },
    { name: "M'Sila", delivery_fee: 600 },
    { name: 'Mascara', delivery_fee: 600 },
    { name: 'Ouargla', delivery_fee: 600 },
    { name: 'Oran', delivery_fee: 600 },
    { name: "El Bayadh", delivery_fee: 600 },
    { name: 'Illizi', delivery_fee: 600 },
    { name: 'Bordj Bou Arréridj', delivery_fee: 600 },
    { name: 'Boumerdès', delivery_fee: 600 },
    { name: "El Tarf", delivery_fee: 600 },
    { name: 'Tindouf', delivery_fee: 600 },
    { name: 'Tissemsilt', delivery_fee: 600 },
    { name: "El Oued", delivery_fee: 600 },
    { name: 'Khenchela', delivery_fee: 600 },
    { name: 'Souk Ahras', delivery_fee: 600 },
    { name: 'Tipaza', delivery_fee: 600 },
    { name: 'Mila', delivery_fee: 600 },
    { name: 'Aïn Defla', delivery_fee: 600 },
    { name: 'Naâma', delivery_fee: 600 },
    { name: 'Aïn Témouchent', delivery_fee: 600 },
    { name: 'Ghardaïa', delivery_fee: 600 },
    { name: 'Relizane', delivery_fee: 600 },
    { name: 'Timimoun', delivery_fee: 600 },
    { name: 'Bordj Badji Mokhtar', delivery_fee: 600 },
    { name: 'Ouled Djellal', delivery_fee: 600 },
    { name: 'Beni Abbes', delivery_fee: 600 },
    { name: 'In Salah', delivery_fee: 600 },
    { name: 'In Guezzam', delivery_fee: 600 },
    { name: 'Touggourt', delivery_fee: 600 },
    { name: 'Djanet', delivery_fee: 600 },
    { name: "El M'Ghair", delivery_fee: 600 },
    { name: 'El Meniaa', delivery_fee: 600 }
  ]
};
