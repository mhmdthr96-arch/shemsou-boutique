-- ==========================================================
-- ⚜️ SHEMSOU BOUTIQUE - Supabase Database Schema & Security
-- Optimized for PostgreSQL Free Tier & High Performance
-- ==========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCTS TABLE (with Multi-Image, Cover Image, and Variant Stock Matrix)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ar TEXT NOT NULL,
    title_fr TEXT,
    title_en TEXT,
    description_ar TEXT,
    description_fr TEXT,
    description_en TEXT,
    price NUMERIC(10, 2) NOT NULL,
    old_price NUMERIC(10, 2),
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    cover_image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb NOT NULL,
    colors JSONB DEFAULT '[]'::jsonb NOT NULL,
    sizes JSONB DEFAULT '[]'::jsonb NOT NULL,
    variants JSONB DEFAULT '[]'::jsonb NOT NULL, -- [{ "color": "black", "size": "38", "stock": 5 }]
    is_featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. STORIES & REELS TABLE (Short Videos / Promotional Images)
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ar TEXT,
    title_fr TEXT,
    title_en TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video')) DEFAULT 'image',
    cloudinary_public_id TEXT,
    tagged_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ORDERS TABLE (Direct Checkout with Selected Size, Color, & Quantity)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_wilaya TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_notes TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    selected_color TEXT NOT NULL,
    selected_size TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 🛡️ PERFORMANCE INDEXES (Optimized for Free Tier Quota)
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_created ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_active ON public.stories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ==========================================================
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Categories RLS
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow auth all categories" ON public.categories FOR ALL TO authenticated USING (true);

-- Products RLS
CREATE POLICY "Allow public read active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Allow auth all products" ON public.products FOR ALL TO authenticated USING (true);

-- Stories RLS
CREATE POLICY "Allow public read active stories" ON public.stories FOR SELECT USING (is_active = true);
CREATE POLICY "Allow auth all stories" ON public.stories FOR ALL TO authenticated USING (true);

-- Orders RLS (Public can only INSERT their order; only authenticated admin can view or modify)
CREATE POLICY "Allow public insert order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow auth all orders" ON public.orders FOR ALL TO authenticated USING (true);

-- Store Settings RLS
CREATE POLICY "Allow public read settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Allow auth all settings" ON public.store_settings FOR ALL TO authenticated USING (true);

-- ==========================================================
-- 📦 SEED DEFAULT STORE CATEGORIES
-- ==========================================================
INSERT INTO public.categories (id, name_ar, name_fr, name_en, slug, icon, sort_order)
VALUES 
    ('all', 'الكل', 'Tous', 'All', 'all', 'Sparkles', 0),
    ('luxury-heels', 'أحذية كعب فاخرة', 'Escarpins & Talons', 'Luxury Heels', 'luxury-heels', 'Crown', 1),
    ('luxury-bags', 'حقائب يد راقية', 'Sacs à Main de Luxe', 'Luxury Handbags', 'luxury-bags', 'ShoppingBag', 2),
    ('sneakers', 'أحذية كاجوال ورياضية', 'Baskets & Sneakers', 'Chic Sneakers', 'sneakers', 'Footprints', 3),
    ('crossbody-travel', 'حقائب كتف وسفر', 'Sacs Bandoulière & Voyage', 'Crossbody & Travel', 'crossbody-travel', 'Briefcase', 4),
    ('accessories', 'محافظ وإكسسوارات', 'Portefeuilles & Accessoires', 'Wallets & Accessories', 'accessories', 'Gem', 5)
ON CONFLICT (id) DO NOTHING;
