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

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    title_ar: 'حقيبة باريسيان الملكية بالجلد الأسود والذهبي',
    title_fr: 'Sac Parisien Royal Cuir Noir & Finitions Or',
    title_en: 'Parisian Royal Handbag in Black & Gold Hardware',
    description_ar: 'حقيبة يد فاخرة مصنوعة من أرقى أنواع الجلد الإيطالي المعالج مع قفل ذهبي منقوش بشعار البوتيك وبطانة حريرية داخلية تتسع لكافة احتياجاتك اليومية والمناسبات الراقية.',
    description_fr: 'Sac iconique en cuir italien d’exception, rehaussé d’un fermoir doré poli et d’une doublure en satin de soie. Élégance intemporelle pour vos grandes occasions.',
    description_en: 'An iconic handbag crafted from exquisite Italian leather, complemented with polished golden hardware and a silk satin lining.',
    price: 8900,
    old_price: 11500,
    category_id: 'luxury-bags',
    cover_image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name_ar: 'أسود ملكي', name_fr: 'Noir Royal', name_en: 'Royal Black', code: 'black', hex: '#111111' },
      { name_ar: 'بيج كراميل', name_fr: 'Beige Caramel', name_en: 'Caramel Beige', code: 'beige', hex: '#D2B48C' },
      { name_ar: 'بورغندي خمري', name_fr: 'Bordeaux Profond', name_en: 'Deep Burgundy', code: 'burgundy', hex: '#65000B' }
    ],
    sizes: ['M (Medium)', 'L (Large)', 'Mini'],
    variants: [
      { color: 'black', size: 'M (Medium)', stock: 4 },
      { color: 'black', size: 'L (Large)', stock: 2 },
      { color: 'black', size: 'Mini', stock: 0 }, // Out of stock -> Will be hidden
      { color: 'beige', size: 'M (Medium)', stock: 3 },
      { color: 'beige', size: 'L (Large)', stock: 0 }, // Out of stock -> Will be hidden
      { color: 'beige', size: 'Mini', stock: 5 },
      { color: 'burgundy', size: 'M (Medium)', stock: 2 },
      { color: 'burgundy', size: 'L (Large)', stock: 1 },
      { color: 'burgundy', size: 'Mini', stock: 0 }
    ],
    is_featured: true,
    is_new: true,
    is_active: true
  },
  {
    id: 'prod-2',
    title_ar: 'حذاء كعب فيرونا كريستال ذهبي مائل للبيج',
    title_fr: 'Escarpins Verona Cristaux Dorés & Nude',
    title_en: 'Verona Crystal Glamour Stiletto Heels',
    description_ar: 'حذاء سهرة ملكي بكعب أنيق 9 سم مزين بقطع الكريستال البراقة وتدرج ذهبي ساحر. نعل مريح ومبطن بطبقة ناعمة لتمنحك ثباتاً وأناقة لا تضاهى طوال الأمسية.',
    description_fr: 'Escarpin de soirée scintillant avec talon aiguille 9cm, orné de cristaux délicats et finition dorée satinée. Semelle intérieure rembourrée grand confort.',
    description_en: 'Dazzling evening stiletto featuring shimmering crystals, a 9cm graceful heel, and ultra-comfortable padded insole.',
    price: 9400,
    old_price: 12800,
    category_id: 'luxury-heels',
    cover_image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name_ar: 'ذهبي مشع', name_fr: 'Or Lumineux', name_en: 'Luminous Gold', code: 'gold', hex: '#D4AF37' },
      { name_ar: 'بيج نود', name_fr: 'Nude Poudré', name_en: 'Powder Nude', code: 'nude', hex: '#EBE3D5' },
      { name_ar: 'أسود مخملي', name_fr: 'Noir Velours', name_en: 'Velvet Black', code: 'black', hex: '#1C1C1C' }
    ],
    sizes: ['36', '37', '38', '39', '40', '41'],
    variants: [
      { color: 'gold', size: '36', stock: 2 },
      { color: 'gold', size: '37', stock: 4 },
      { color: 'gold', size: '38', stock: 5 },
      { color: 'gold', size: '39', stock: 0 }, // Out of stock -> Will hide
      { color: 'gold', size: '40', stock: 1 },
      { color: 'gold', size: '41', stock: 0 },
      { color: 'nude', size: '36', stock: 0 },
      { color: 'nude', size: '37', stock: 3 },
      { color: 'nude', size: '38', stock: 2 },
      { color: 'nude', size: '39', stock: 4 },
      { color: 'nude', size: '40', stock: 0 },
      { color: 'black', size: '37', stock: 2 },
      { color: 'black', size: '38', stock: 3 },
      { color: 'black', size: '39', stock: 2 },
      { color: 'black', size: '40', stock: 2 }
    ],
    is_featured: true,
    is_new: true,
    is_active: true
  },
  {
    id: 'prod-3',
    title_ar: 'حقيبة كلاسيك موناكو بحزام سلسلة ذهبية',
    title_fr: 'Sac Monaco Chaîne Dorée & Cuir Matelassé',
    title_en: 'Monaco Quilted Shoulder Bag with Gold Chain',
    description_ar: 'قطعة فنية تجسد فخامة الموضة الباريسية بتطريز هندسي مضلع وحزام معدني باللون الذهبي اللامع قابل للتعديل للارتداء على الكتف أو الكروس.',
    description_fr: 'Création somptueuse en cuir matelassé à motifs chevrons, accompagnée d’une chaîne dorée ajustable pour un porté épaule ou croisé impeccable.',
    description_en: 'A statement quilted leather bag with chevron detailing and an adjustable luminous gold chain strap.',
    price: 7800,
    old_price: 9900,
    category_id: 'luxury-bags',
    cover_image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name_ar: 'بيج رملي', name_fr: 'Beige Sable', name_en: 'Sand Beige', code: 'beige', hex: '#E5D3B3' },
      { name_ar: 'أسود داكن', name_fr: 'Noir Onyx', name_en: 'Onyx Black', code: 'black', hex: '#111111' },
      { name_ar: 'أبيض عاجي', name_fr: 'Blanc Ivoire', name_en: 'Ivory White', code: 'white', hex: '#FDFBF7' }
    ],
    sizes: ['Standard Medium', 'Compact Mini'],
    variants: [
      { color: 'beige', size: 'Standard Medium', stock: 3 },
      { color: 'beige', size: 'Compact Mini', stock: 2 },
      { color: 'black', size: 'Standard Medium', stock: 5 },
      { color: 'black', size: 'Compact Mini', stock: 0 },
      { color: 'white', size: 'Standard Medium', stock: 2 },
      { color: 'white', size: 'Compact Mini', stock: 3 }
    ],
    is_featured: false,
    is_new: true,
    is_active: true
  },
  {
    id: 'prod-4',
    title_ar: 'سنيكرز إير فورتي فاخر بنعل مريح وتطريز ذهبي',
    title_fr: 'Sneakers Air Forty Cuir Blanc & Accents Or',
    title_en: 'Air Forty Luxe White Sneakers with Gold Accents',
    description_ar: 'سنيكرز راقي مصمم يدوياً من الجلد الطبيعي الأبيض الصافي مع لمسات ذهبية براقة على الكعب والأربطة، يمنحك خفة فائقة وأناقة عصرية في الإطلالات اليومية.',
    description_fr: 'Sneakers premium en cuir blanc immaculé rehaussées de touches dorées au talon. Confort exceptionnel et look branché chic.',
    description_en: 'Handcrafted luxury white leather sneakers accented with gold heel tabs and ergonomic cushioned sole.',
    price: 6900,
    old_price: 8500,
    category_id: 'sneakers',
    cover_image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name_ar: 'أبيض لؤلؤي وذهبي', name_fr: 'Blanc Perle & Or', name_en: 'Pearl White & Gold', code: 'white-gold', hex: '#F4E8C1' },
      { name_ar: 'أسود مع ذهبي', name_fr: 'Noir & Or', name_en: 'Black & Gold', code: 'black-gold', hex: '#1E1E1E' }
    ],
    sizes: ['39', '40', '41', '42', '43', '44'],
    variants: [
      { color: 'white-gold', size: '39', stock: 2 },
      { color: 'white-gold', size: '40', stock: 3 }, // User mentioned example: Air Force White size 40 has 3 pieces
      { color: 'white-gold', size: '41', stock: 4 },
      { color: 'white-gold', size: '42', stock: 0 }, // Out of stock -> Will hide
      { color: 'white-gold', size: '43', stock: 2 },
      { color: 'white-gold', size: '44', stock: 0 },
      { color: 'black-gold', size: '40', stock: 2 },
      { color: 'black-gold', size: '41', stock: 3 },
      { color: 'black-gold', size: '42', stock: 2 },
      { color: 'black-gold', size: '43', stock: 0 }
    ],
    is_featured: true,
    is_new: false,
    is_active: true
  },
  {
    id: 'prod-5',
    title_ar: 'حقيبة سفر وكروس فينيسيا الجلدية الفاخرة',
    title_fr: 'Sac Bandoulière & Voyage Venezia Cuir Havana',
    title_en: 'Venezia Luxury Leather Crossbody & Travel Bag',
    description_ar: 'حقيبة واسعة وعملية مصممة للرحلات والخرجات اليومية بتصميم جذاب، مقبض علوي مريح مع حزام كتف عريض وجيوب متعددة منظمة بدقة.',
    description_fr: 'Sac spacieux et polyvalent en cuir pleine fleur, idéal pour les escapades ou l’usage quotidien avec multiples compartiments sécurisés.',
    description_en: 'Spacious and sophisticated full-grain leather crossbody duffle bag with secure golden zip compartments.',
    price: 11200,
    old_price: 14500,
    category_id: 'crossbody-travel',
    cover_image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name_ar: 'بني هافان', name_fr: 'Marron Havane', name_en: 'Havana Brown', code: 'brown', hex: '#8B4513' },
      { name_ar: 'أسود كربوني', name_fr: 'Noir Carbone', name_en: 'Carbon Black', code: 'black', hex: '#222222' }
    ],
    sizes: ['Large (45cm)', 'Medium (38cm)'],
    variants: [
      { color: 'brown', size: 'Large (45cm)', stock: 2 },
      { color: 'brown', size: 'Medium (38cm)', stock: 3 },
      { color: 'black', size: 'Large (45cm)', stock: 1 },
      { color: 'black', size: 'Medium (38cm)', stock: 0 }
    ],
    is_featured: false,
    is_new: true,
    is_active: true
  },
  {
    id: 'prod-6',
    title_ar: 'محفظة شمسو رويال الجلدية مع سلسلة معصم ذهبية',
    title_fr: 'Portefeuille Royal Cuir & Dragonne Dorée',
    title_en: 'Royal Leather Wallet with Golden Wristlet',
    description_ar: 'محفظة راقية تتسع للهاتف والبطاقات والنقود بتصميم نحيف وأنيق مع سحاب ذهبي ناعم وسلسلة يد للإمساك بكل سهولة وأناقة.',
    description_fr: 'Portefeuille luxueux multifonction avec fermeture zippée dorée et dragonne amovible. Raffinement garanti.',
    description_en: 'Elegant slim wallet with dedicated phone compartment, card slots, and detachable gold chain wristlet.',
    price: 3900,
    old_price: 4900,
    category_id: 'accessories',
    cover_image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name_ar: 'بيج ذهبي', name_fr: 'Beige Doré', name_en: 'Golden Beige', code: 'beige-gold', hex: '#E8D8B8' },
      { name_ar: 'أسود كلاسيك', name_fr: 'Noir Classique', name_en: 'Classic Black', code: 'black', hex: '#111111' },
      { name_ar: 'وردي ناعم', name_fr: 'Rose Poudré', name_en: 'Soft Rose', code: 'rose', hex: '#E2B4B7' }
    ],
    sizes: ['One Size'],
    variants: [
      { color: 'beige-gold', size: 'One Size', stock: 6 },
      { color: 'black', size: 'One Size', stock: 4 },
      { color: 'rose', size: 'One Size', stock: 3 }
    ],
    is_featured: false,
    is_new: false,
    is_active: true
  }
];

export const INITIAL_STORE_SETTINGS = {
  whatsapp_number: '213555000000',
  contact_phone: '+213 555 00 00 00',
  store_email: 'contact@shemsou-boutique.com',
  delivery_fee: 600,
  free_delivery_threshold: 15000,
  announcement_ar: '✨ مرحباً بكم في SHEMSOU BOUTIQUE • توصيل سريع لكافة الولايات • الدفع عند الاستلام 🚚',
  announcement_fr: '✨ Bienvenue chez SHEMSOU BOUTIQUE • Livraison rapide • Paiement à la livraison 🚚',
  announcement_en: '✨ Welcome to SHEMSOU BOUTIQUE • Express Delivery • Cash on Delivery 🚚'
};
