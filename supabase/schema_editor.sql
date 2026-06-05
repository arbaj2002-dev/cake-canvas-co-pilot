-- =============================================================
-- Frostique – Cake Canvas Co-Pilot
-- Complete schema for the Supabase SQL Editor
-- Paste this entire file into: Supabase Dashboard → SQL Editor
-- =============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enum ─────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Utility trigger function for updated_at ──────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================================
-- TABLES  (in FK-dependency order)
-- =============================================================

-- ── categories ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── products ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID           NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT           NOT NULL,
  description TEXT,
  base_price  DECIMAL(10,2)  NOT NULL,
  image_url   TEXT,
  category_id UUID           REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active   BOOLEAN        NOT NULL DEFAULT true,
  is_featured BOOLEAN        NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- ── product_sizes ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_sizes (
  id               UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id       UUID          REFERENCES public.products(id) ON DELETE CASCADE,
  size_name        TEXT          NOT NULL,
  weight           TEXT,
  price_multiplier DECIMAL(5,2)  DEFAULT 1.0,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── addons ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.addons (
  id          UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT          NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  type        TEXT          NOT NULL,
  is_active   BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── coupons ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupons (
  id                 UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code               TEXT          NOT NULL UNIQUE,
  description        TEXT,
  discount_type      TEXT          NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value     DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  is_active          BOOLEAN       NOT NULL DEFAULT true,
  is_first_time_only BOOLEAN       NOT NULL DEFAULT false,
  max_uses           INTEGER,
  max_uses_per_user  INTEGER,
  min_order_amount   DECIMAL(10,2) DEFAULT 0,
  expires_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── orders ───────────────────────────────────────────────────
-- customer_id references auth.users (nullable for future guest orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id      UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
  delivery_name    TEXT          NOT NULL,
  delivery_phone   TEXT          NOT NULL,
  delivery_address TEXT          NOT NULL,
  order_notes      TEXT,
  total_amount     DECIMAL(10,2) NOT NULL,
  status           TEXT          NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','preparing','ready','delivered','cancelled')),
  payment_method   TEXT          NOT NULL CHECK (payment_method IN ('cod', 'online')),
  payment_status   TEXT          NOT NULL DEFAULT 'pending'
                   CHECK (payment_status IN ('pending', 'completed', 'failed')),
  coupon_id        UUID          REFERENCES public.coupons(id) ON DELETE SET NULL,
  discount_amount  DECIMAL(10,2) DEFAULT 0,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── order_items ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id              UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id        UUID          REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      UUID          REFERENCES public.products(id) ON DELETE SET NULL,
  product_size_id UUID          REFERENCES public.product_sizes(id) ON DELETE SET NULL,
  quantity        INTEGER       NOT NULL DEFAULT 1,
  unit_price      DECIMAL(10,2) NOT NULL,
  custom_message  TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── order_addons ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_addons (
  id            UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id UUID          REFERENCES public.order_items(id) ON DELETE CASCADE,
  addon_id      UUID          REFERENCES public.addons(id) ON DELETE SET NULL,
  quantity      INTEGER       NOT NULL DEFAULT 1,
  unit_price    DECIMAL(10,2) NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── coupon_usages ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id              UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id       UUID          NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id         UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id        UUID          REFERENCES public.orders(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT        NOT NULL DEFAULT '',
  phone      TEXT,
  address    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── customers ────────────────────────────────────────────────
-- Admin-managed customer records (separate from auth users / profiles)
CREATE TABLE IF NOT EXISTS public.customers (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  phone      TEXT        NOT NULL,
  email      TEXT,
  address    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── customer_queries ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customer_queries (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT,
  phone      TEXT,
  message    TEXT        NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'PENDING'
             CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── favorites ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.favorites (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- ── user_roles ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID            NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID            NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ     NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ── gallery ──────────────────────────────────────────────────
-- Not in auto-generated types.ts because it was added as an untyped query.
-- The ManageGallery admin page uses supabase.from("gallery" as any).
CREATE TABLE IF NOT EXISTS public.gallery (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT        NOT NULL DEFAULT 'Untitled',
  image_url  TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_products_category_id       ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active          ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured        ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id    ON public.product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id          ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status               ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id        ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_addons_order_item_id  ON public.order_addons(order_item_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id     ON public.coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id       ON public.coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_order_id      ON public.coupon_usages(order_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code                ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active           ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id           ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id          ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id            ON public.profiles(user_id);

-- =============================================================
-- TRIGGERS  (updated_at auto-update)
-- =============================================================
DROP TRIGGER IF EXISTS update_categories_updated_at      ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at        ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at         ON public.coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at          ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at        ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at       ON public.customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_queries_updated_at ON public.customer_queries;
CREATE TRIGGER update_customer_queries_updated_at
  BEFORE UPDATE ON public.customer_queries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- FUNCTIONS
-- =============================================================

-- Returns true if _user_id has _role (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role    = _role
  );
$$;

-- Returns the role of a given user (returns NULL if none found)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- Runs after a new auth.users row is inserted.
-- Creates a profile record and assigns the default 'user' role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- =============================================================
-- AUTH TRIGGER  (profile + role on signup)
-- =============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- ROW LEVEL SECURITY  (enable on every table)
-- =============================================================
ALTER TABLE public.categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_addons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery          ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- RLS POLICIES
-- =============================================================

-- ── categories ──────────────────────────────────────────────
CREATE POLICY "Public can read categories"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ── products ────────────────────────────────────────────────
CREATE POLICY "Public can read products"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ── product_sizes ────────────────────────────────────────────
CREATE POLICY "Public can read product sizes"
  ON public.product_sizes FOR SELECT USING (true);

CREATE POLICY "Admins can manage product sizes"
  ON public.product_sizes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ── addons ───────────────────────────────────────────────────
CREATE POLICY "Public can read addons"
  ON public.addons FOR SELECT USING (true);

CREATE POLICY "Admins can manage addons"
  ON public.addons FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ── coupons ──────────────────────────────────────────────────
-- Anyone authenticated can look up a coupon by code (needed for checkout validation)
CREATE POLICY "Authenticated users can read coupons"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ── orders ───────────────────────────────────────────────────
CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Admins can read all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ── order_items ──────────────────────────────────────────────
CREATE POLICY "Users can read own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Authenticated users can insert order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── order_addons ─────────────────────────────────────────────
CREATE POLICY "Users can read own order addons"
  ON public.order_addons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      WHERE oi.id = order_addons.order_item_id
        AND (o.customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Authenticated users can insert order addons"
  ON public.order_addons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── coupon_usages ────────────────────────────────────────────
CREATE POLICY "Users can read own coupon usages"
  ON public.coupon_usages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can insert coupon usages"
  ON public.coupon_usages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── profiles ─────────────────────────────────────────────────
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── customers ────────────────────────────────────────────────
CREATE POLICY "Admins can manage customers"
  ON public.customers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ── customer_queries ─────────────────────────────────────────
-- Anyone (including anon) can submit a contact form
CREATE POLICY "Anyone can submit a query"
  ON public.customer_queries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read customer queries"
  ON public.customer_queries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update customer queries"
  ON public.customer_queries FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ── favorites ────────────────────────────────────────────────
CREATE POLICY "Users can read own favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ── user_roles ───────────────────────────────────────────────
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ── gallery ──────────────────────────────────────────────────
CREATE POLICY "Public can read gallery"
  ON public.gallery FOR SELECT USING (true);

CREATE POLICY "Admins can manage gallery"
  ON public.gallery FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- STORAGE BUCKETS
-- =============================================================

-- 'cakes' bucket – product images (used by ManageCakes)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cakes', 'cakes', true)
ON CONFLICT (id) DO NOTHING;

-- 'images' bucket – gallery images (used by ManageGallery)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies – cakes bucket
CREATE POLICY "Public can read cake images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cakes');

CREATE POLICY "Admins can upload cake images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cakes' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update cake images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'cakes' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'cakes' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete cake images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'cakes' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies – images (gallery) bucket
CREATE POLICY "Public can read gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

CREATE POLICY "Admins can upload gallery images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- SAMPLE DATA  (optional – remove if not needed)
-- =============================================================

INSERT INTO public.categories (name, description) VALUES
  ('Birthday',   'Perfect cakes for birthday celebrations'),
  ('Wedding',    'Elegant wedding cakes'),
  ('Anniversary','Romantic anniversary cakes'),
  ('Special',    'Special occasion cakes'),
  ('Chocolate',  'Rich chocolate cakes'),
  ('Fruit',      'Fresh fruit-topped cakes')
ON CONFLICT DO NOTHING;

INSERT INTO public.addons (name, description, price, type, is_active) VALUES
  ('Birthday Candles Set', 'Set of colourful birthday candles',    50,  'decoration', true),
  ('Heart Balloons',       'Pack of heart-shaped balloons',        100, 'decoration', true),
  ('Chocolate Sticks',     'Decorative chocolate sticks',          75,  'topping',    true),
  ('Fresh Strawberries',   'Fresh strawberry topping',             150, 'topping',    true),
  ('Custom Message Card',  'Personalised message card',            25,  'extras',     true),
  ('Gold Dust Sprinkles',  'Edible gold dust for decoration',      60,  'topping',    true)
ON CONFLICT DO NOTHING;

-- =============================================================
-- ADMIN USER SETUP
-- After running this file, grant admin access to your account:
--
--   1. Sign up / log in via the app to create your auth user.
--   2. Find your User ID in: Supabase Dashboard → Authentication → Users
--   3. Replace <YOUR_USER_ID_HERE> below and run ONLY that line:
--
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('<YOUR_USER_ID_HERE>', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;
--
-- =============================================================
