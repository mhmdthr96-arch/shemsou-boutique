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
        .upsert([productToSave])
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
 * Decrement stock after order placement
 */
export async function decrementStock(productId, selectedColorCode, selectedSize, orderedQty) {
  const products = await getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const variants = [...(product.variants || [])];
  const variantIndex = variants.findIndex(
    v => (v.color === selectedColorCode || v.color_code === selectedColorCode) && v.size === selectedSize
  );

  if (variantIndex >= 0) {
    const currentStock = Number(variants[variantIndex].stock) || 0;
    variants[variantIndex].stock = Math.max(0, currentStock - orderedQty);
    product.variants = variants;
    await saveProduct(product);
  }
}

/**
 * Load Categories
 */
export async function getCategories() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase categories error', e);
    }
  }
  return INITIAL_CATEGORIES;
}

/**
 * Load Stories / Reels
 */
export async function getStories() {
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
      console.warn('Supabase stories error', e);
    }
  }

  try {
    const local = localStorage.getItem(LOCAL_STORIES_KEY);
    if (local) return JSON.parse(local);
  } catch (e) {
    console.error(e);
  }

  localStorage.setItem(LOCAL_STORIES_KEY, JSON.stringify(INITIAL_STORIES));
  return INITIAL_STORIES;
}

/**
 * Save Story
 */
export async function saveStory(story) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('stories').upsert([story]).select();
      if (!error && data) {
        updateLocalStory(story);
        return data[0];
      }
    } catch (e) {
      console.warn(e);
    }
  }
  return updateLocalStory(story);
}

function updateLocalStory(story) {
  let stories = [];
  try {
    const local = localStorage.getItem(LOCAL_STORIES_KEY);
    stories = local ? JSON.parse(local) : [...INITIAL_STORIES];
  } catch {
    stories = [...INITIAL_STORIES];
  }

  const idx = stories.findIndex(s => s.id === story.id);
  if (idx >= 0) stories[idx] = story;
  else stories.unshift(story);

  localStorage.setItem(LOCAL_STORIES_KEY, JSON.stringify(stories));
  return story;
}

/**
 * Delete Story (Manual Admin Action)
 */
export async function deleteStory(storyId) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('stories').delete().eq('id', storyId);
    } catch (e) {
      console.warn(e);
    }
  }

  try {
    const local = localStorage.getItem(LOCAL_STORIES_KEY);
    if (local) {
      const stories = JSON.parse(local).filter(s => s.id !== storyId);
      localStorage.setItem(LOCAL_STORIES_KEY, JSON.stringify(stories));
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
    created_at: new Date().toISOString()
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').insert([finalOrder]).select();
      if (!error && data) {
        saveLocalOrder(finalOrder);
        await decrementStock(finalOrder.product_id, finalOrder.selected_color, finalOrder.selected_size, finalOrder.quantity);
        return finalOrder;
      }
    } catch (e) {
      console.warn('Supabase order insert failed, saving locally', e);
    }
  }

  // Save locally & decrement stock
  saveLocalOrder(finalOrder);
  await decrementStock(finalOrder.product_id, finalOrder.selected_color, finalOrder.selected_size, finalOrder.quantity);
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
        await supabase.from('store_settings').upsert({ key, value, updated_at: new Date().toISOString() });
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
