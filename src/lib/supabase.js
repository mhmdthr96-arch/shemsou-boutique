/**
 * ⚜️ SHEMSOU BOUTIQUE - Supabase Client & Data Synchronization
 * Hybrid architecture: Connects directly to Supabase with Row Level Security,
 * with smart local storage fallback so the store is instantly usable 24/7.
 */

import { createClient } from '@supabase/supabase-js';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_STORIES, INITIAL_STORE_SETTINGS } from './initialData';

const SUPABASE_CONFIG_KEY = 'shemsou_supabase_config';
const LOCAL_PRODUCTS_KEY = 'shemsou_local_products';
const LOCAL_STORIES_KEY = 'shemsou_local_stories';
const LOCAL_ORDERS_KEY = 'shemsou_local_orders';
const LOCAL_SETTINGS_KEY = 'shemsou_local_settings';
const LOCAL_CATEGORIES_KEY = 'shemsou_local_categories';

// -------------------------------------------------------------
// SCHEMA-AWARE COLUMN FILTERING
// The app may send fields that don't exist in a given Supabase
// table (e.g. `duration` on stories, `source` on orders). Postgres
// rejects the whole insert/upsert on an unknown column, so we
// strip payloads down to the columns that actually exist. This
// keeps every admin write succeeding instead of silently falling
// back to localStorage.
// -------------------------------------------------------------
const TABLE_COLUMNS = {
  products: ['id','title_ar','title_fr','title_en','description_ar','description_fr','description_en','price','old_price','category_id','cover_image','images','colors','sizes','variants','is_featured','is_new','is_active','created_at','updated_at'],
  stories: ['id','title_ar','title_fr','title_en','media_url','media_type','cloudinary_public_id','tagged_product_id','is_active','sort_order','created_at','duration'],
  orders: ['id','order_number','customer_name','customer_phone','customer_wilaya','customer_address','customer_notes','product_id','product_title','selected_color','selected_color_code','selected_size','quantity','unit_price','total_price','status','ip_address','created_at','delivery_fee'],
  categories: ['id','name_ar','name_fr','name_en','slug','icon','sort_order','created_at'],
  store_settings: ['key','value','updated_at']
};

function pickColumns(table, obj) {
  const allowed = TABLE_COLUMNS[table];
  if (!allowed || !obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const key of allowed) {
    if (obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
}

export function getSupabaseCredentials() {
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.key) return parsed;
    }
  } catch (e) {
    console.error('Failed to read Supabase config', e);
  }

  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
}

export function saveSupabaseCredentials(url, key) {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({ url: url.trim(), key: key.trim() }));
    supabaseClientInstance = null; // Reset client
    return true;
  } catch (e) {
    console.error('Failed to save Supabase config', e);
    return false;
  }
}

let supabaseClientInstance = null;

export function getSupabaseClient() {
  if (supabaseClientInstance) return supabaseClientInstance;
  
  const { url, key } = getSupabaseCredentials();
  if (url && key && url.startsWith('http')) {
    try {
      supabaseClientInstance = createClient(url, key, {
        auth: { persistSession: true },
        db: { schema: 'public' }
      });
      return supabaseClientInstance;
    } catch (e) {
      console.warn('Could not initialize Supabase client, using local mode', e);
    }
  }
  return null;
}

export async function testSupabaseConnection(url, key) {
  if (!url || !key) return { success: false, message: 'يرجى إدخال الرابط والمفتاح' };
  try {
    const tempClient = createClient(url.trim(), key.trim());
    const { error } = await tempClient.from('categories').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'تم الاتصال بقاعدة بيانات Supabase بنجاح!' };
  } catch (err) {
    return { success: false, message: err.message || 'فشل الاتصال بـ Supabase' };
  }
}

// -------------------------------------------------------------
// DATA MANAGEMENT (HYBRID: SUPABASE / LOCAL STATE)
// -------------------------------------------------------------

/**
 * Load all products
 */
export async function getProducts() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local data', e);
    }
  }

  // Local fallback
  try {
    const local = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (local) return JSON.parse(local);
  } catch (e) {
    console.error(e);
  }

  // Initialize with initial luxury data
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

/**
 * Save / Update Product
 */
export async function saveProduct(product) {
  const supabase = getSupabaseClient();
  const productToSave = {
    ...product,
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .upsert([pickColumns('products', productToSave)])
        .select();
      if (!error && data) {
        // Also update local cache
        updateLocalProduct(productToSave);
        return data[0];
      }
    } catch (e) {
      console.warn('Supabase upsert error', e);
    }
  }

  // Local save
  return updateLocalProduct(productToSave);
}

function updateLocalProduct(product) {
  let products = [];
  try {
    const local = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    products = local ? JSON.parse(local) : [...INITIAL_PRODUCTS];
  } catch {
    products = [...INITIAL_PRODUCTS];
  }

  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product);
  }

  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  return product;
}

/**
 * Delete product permanently (Manual Admin Action)
 */
export async function deleteProduct(productId) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (e) {
      console.warn('Supabase delete error', e);
    }
  }

  try {
    const local = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (local) {
      const products = JSON.parse(local).filter(p => p.id !== productId);
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
    }
  } catch (e) {
    console.error(e);
  }
  return true;
}

/**
 * Delete ALL products (Admin "start fresh" action)
 */
export async function deleteAllProducts() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('products').select('id');
      if (data && data.length > 0) {
        for (const p of data) {
          await supabase.from('products').delete().eq('id', p.id);
        }
      }
    } catch (e) {
      console.warn('Supabase bulk delete error', e);
    }
  }

  try {
    localStorage.removeItem(LOCAL_PRODUCTS_KEY);
  } catch (e) {
    console.error(e);
  }
  return true;
}

/**
 * Cleanup leftover demo/seed products (non-UUID ids, e.g. "prod-1")
 * while preserving all real (UUID) products. Runs silently on load.
 */
export async function cleanupDemoProducts() {
  const DEMO_ID = /^prod-\d+$/;

  const removeFromLocal = () => {
    try {
      const local = localStorage.getItem(LOCAL_PRODUCTS_KEY);
      if (local) {
        const products = JSON.parse(local).filter(p => !DEMO_ID.test(String(p.id)));
        localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('products').select('id').eq('is_active', true);
      const demoIds = (data || []).map(d => d.id).filter(id => DEMO_ID.test(String(id)));
      for (const id of demoIds) {
        await supabase.from('products').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase demo cleanup error', e);
    }
  }

  removeFromLocal();
  return true;
}

/**
 * Adjust a product variant's stock.
 * @param {string} productId
 * @param {string} selectedColorCode - the variant color CODE (matches variants[].color)
 * @param {string} selectedSize
 * @param {number} deltaQty - positive to deduct (e.g. on confirm/deliver), negative to restore (e.g. on cancel)
 */
export async function adjustStock(productId, selectedColorCode, selectedSize, deltaQty) {
  if (!productId || !selectedColorCode || !selectedSize || !deltaQty) return;

  const products = await getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const variants = [...(product.variants || [])];
  const variantIndex = variants.findIndex(
    v => (v.color === selectedColorCode || v.color_code === selectedColorCode) && v.size === selectedSize
  );

  if (variantIndex >= 0) {
    const currentStock = Number(variants[variantIndex].stock) || 0;
    variants[variantIndex].stock = Math.max(0, currentStock - deltaQty);
    product.variants = variants;
    await saveProduct(product);
  }
}

/**
 * Load Categories
 */
function getLocalCategories() {
  try {
    const local = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    return local ? JSON.parse(local) : [];
  } catch {
    return [];
  }
}

export async function getCategories() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        // Merge any categories the admin added while offline so they stay visible
        const localCats = getLocalCategories();
        const merged = [...data];
        localCats.forEach((c) => {
          if (!merged.find((m) => m.id === c.id)) merged.push(c);
        });
        return merged;
      }
    } catch (e) {
      console.warn('Supabase categories error', e);
    }
  }
  return [...INITIAL_CATEGORIES, ...getLocalCategories()];
}

/**
 * Save / Update Category (Admin "add my own category" action)
 */
export async function saveCategory(category) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('categories').upsert([pickColumns('categories', category)]);
      if (!error) {
        updateLocalCategory(category);
        return category;
      }
    } catch (e) {
      console.warn('Supabase category upsert error', e);
    }
  }
  return updateLocalCategory(category);
}

function updateLocalCategory(category) {
  const cats = getLocalCategories();
  const index = cats.findIndex((c) => c.id === category.id);
  if (index >= 0) cats[index] = category;
  else cats.push(category);
  try {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(cats));
  } catch (e) {
    console.error(e);
  }
  return category;
}

/**
 * ⚜️ Load Hero Slider Slides
 */
const LOCAL_SLIDES_KEY = 'shemsou_local_slides';

export async function getSlides() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase slides error', e);
    }
  }

  try {
    const local = localStorage.getItem(LOCAL_SLIDES_KEY);
    if (local) return JSON.parse(local);
  } catch (e) {
    console.error(e);
  }
  return [];
}

/**
 * Save Slide
 */
export async function saveSlide(slide) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('stories').upsert([pickColumns('stories', slide)]).select();
      if (!error && data) {
        updateLocalSlide(slide);
        return data[0];
      }
    } catch (e) {
      console.warn(e);
    }
  }
  return updateLocalSlide(slide);
}

function updateLocalSlide(slide) {
  let slides = [];
  try {
    const local = localStorage.getItem(LOCAL_SLIDES_KEY);
    slides = local ? JSON.parse(local) : [];
  } catch {
    slides = [];
  }

  const idx = slides.findIndex(s => s.id === slide.id);
  if (idx >= 0) slides[idx] = slide;
  else slides.push(slide);

  localStorage.setItem(LOCAL_SLIDES_KEY, JSON.stringify(slides));
  return slide;
}

/**
 * Delete Slide (Manual Admin Action — also cleans Cloudinary via caller)
 */
export async function deleteSlide(slideId) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('stories').delete().eq('id', slideId);
    } catch (e) {
      console.warn(e);
    }
  }

  try {
    const local = localStorage.getItem(LOCAL_SLIDES_KEY);
    if (local) {
      const slides = JSON.parse(local).filter(s => s.id !== slideId);
      localStorage.setItem(LOCAL_SLIDES_KEY, JSON.stringify(slides));
    }
  } catch (e) {
    console.error(e);
  }
  return true;
}

/**
 * Create Order
 */
export async function createOrder(orderPayload) {
  const orderNumber = `SB-${Date.now().toString().slice(-6)}`;
  const finalOrder = {
    ...orderPayload,
    order_number: orderNumber,
    status: 'pending',
    delivery_fee: orderPayload.delivery_fee ? Number(orderPayload.delivery_fee) : 0,
    created_at: new Date().toISOString()
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').insert([pickColumns('orders', finalOrder)]).select();
      if (!error && data) {
        saveLocalOrder(finalOrder);
        return finalOrder;
      }
    } catch (e) {
      console.warn('Supabase order insert failed, saving locally', e);
    }
  }

  // Save locally (stock is adjusted later by the admin when the order is confirmed/delivered)
  saveLocalOrder(finalOrder);
  return finalOrder;
}

function saveLocalOrder(order) {
  let orders = [];
  try {
    const local = localStorage.getItem(LOCAL_ORDERS_KEY);
    orders = local ? JSON.parse(local) : [];
  } catch {
    orders = [];
  }
  orders.unshift(order);
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

/**
 * Get Orders (Admin)
 */
export async function getOrders() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn(e);
    }
  }

  try {
    const local = localStorage.getItem(LOCAL_ORDERS_KEY);
    return local ? JSON.parse(local) : [];
  } catch {
    return [];
  }
}

/**
 * Update Order Status
 */
export async function updateOrderStatus(orderNumber, status) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('orders').update({ status }).eq('order_number', orderNumber);
    } catch (e) {
      console.warn(e);
    }
  }

  try {
    const local = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (local) {
      const orders = JSON.parse(local).map(o => (o.order_number === orderNumber ? { ...o, status } : o));
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    }
  } catch (e) {
    console.error(e);
  }
  return true;
}

/**
 * Store Settings
 */
export async function getStoreSettings() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('store_settings').select('*');
      if (!error && data && data.length > 0) {
        const settings = {};
        data.forEach(item => { settings[item.key] = item.value; });
        return { ...INITIAL_STORE_SETTINGS, ...settings };
      }
    } catch (e) {
      console.warn(e);
    }
  }

  try {
    const local = localStorage.getItem(LOCAL_SETTINGS_KEY);
    return local ? { ...INITIAL_STORE_SETTINGS, ...JSON.parse(local) } : INITIAL_STORE_SETTINGS;
  } catch {
    return INITIAL_STORE_SETTINGS;
  }
}

export async function saveStoreSettings(settings) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase.from('store_settings').upsert(pickColumns('store_settings', { key, value, updated_at: new Date().toISOString() }));
      }
    } catch (e) {
      console.warn(e);
    }
  }

  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error(e);
  }
  return true;
}

// -------------------------------------------------------------
// ONE-TIME LOCAL → SUPABASE MIGRATION
// Runs once per admin session. Pushes any data the admin created
// while offline / before Supabase was wired up (products, slides,
// orders) into Supabase so it becomes visible to customers and
// recoverable. Upserts are idempotent (keyed by id / order_number).
// -------------------------------------------------------------
let migrationRan = false;

export async function migrateLocalDataToSupabase() {
  if (migrationRan) return;
  migrationRan = true;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  const readLocal = (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  try {
    // Products
    const products = readLocal(LOCAL_PRODUCTS_KEY);
    for (const p of products) {
      const clean = pickColumns('products', p);
      if (clean && clean.id) {
        await supabase.from('products').upsert([clean]).select();
      }
    }

    // Slides
    const slides = readLocal(LOCAL_SLIDES_KEY);
    for (const s of slides) {
      const clean = pickColumns('stories', s);
      if (clean && clean.id) {
        await supabase.from('stories').upsert([clean]).select();
      }
    }

    // Orders (let the DB generate id; dedupe by order_number)
    const orders = readLocal(LOCAL_ORDERS_KEY);
    for (const o of orders) {
      const { id, ...rest } = o;
      const clean = pickColumns('orders', rest);
      if (clean && clean.order_number) {
        await supabase.from('orders').upsert([clean], { onConflict: 'order_number' }).select();
      }
    }
  } catch (e) {
    console.warn('Local → Supabase migration skipped:', e);
  }
}
