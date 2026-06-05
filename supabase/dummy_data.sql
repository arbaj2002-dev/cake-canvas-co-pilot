-- =============================================================
-- Frostique – Dummy Data
-- Paste into: Supabase Dashboard → SQL Editor → Run
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)
-- =============================================================

-- =============================================================
-- PRODUCTS  (12 cakes across all categories)
-- =============================================================
INSERT INTO public.products (name, description, base_price, category_id, is_active, is_featured, image_url) VALUES

-- Birthday cakes
('Chocolate Birthday Delight',
 'Rich dark chocolate cake layered with velvety ganache and topped with chocolate shavings. A must-have for every chocolate lover.',
 899,
 (SELECT id FROM public.categories WHERE name = 'Birthday'),
 true, true, null),

('Rainbow Sprinkle Bash',
 'Vibrant multi-coloured layers inside, frosted with vanilla buttercream and loaded with rainbow sprinkles. Pure party magic.',
 1099,
 (SELECT id FROM public.categories WHERE name = 'Birthday'),
 true, true, null),

('Strawberry Bliss Birthday',
 'Light vanilla sponge filled with fresh strawberry compote and whipped cream. Decorated with whole strawberries on top.',
 999,
 (SELECT id FROM public.categories WHERE name = 'Birthday'),
 true, false, null),

-- Wedding cakes
('Classic White Elegance',
 'Three-tier vanilla bean cake draped in smooth white fondant with hand-crafted sugar roses. The timeless wedding centrepiece.',
 4999,
 (SELECT id FROM public.categories WHERE name = 'Wedding'),
 true, true, null),

('Rustic Naked Wedding Cake',
 'Semi-naked buttercream cake adorned with fresh flowers, berries, and eucalyptus sprigs. Boho-chic and effortlessly beautiful.',
 3999,
 (SELECT id FROM public.categories WHERE name = 'Wedding'),
 true, false, null),

-- Anniversary cakes
('Red Velvet Romance',
 'Classic red velvet layers with cream cheese frosting, decorated with edible rose petals and a golden "Forever" topper.',
 1499,
 (SELECT id FROM public.categories WHERE name = 'Anniversary'),
 true, true, null),

('Caramel Hazelnut Dream',
 'Moist hazelnut sponge layered with salted caramel buttercream and a glossy caramel drip. Rich, indulgent, and deeply romantic.',
 1299,
 (SELECT id FROM public.categories WHERE name = 'Anniversary'),
 true, false, null),

-- Special cakes
('Piñata Surprise Cake',
 'Striking cake with a hollow centre filled with colourful candy surprises. Cut it open and let the fun pour out!',
 1599,
 (SELECT id FROM public.categories WHERE name = 'Special'),
 true, true, null),

('Photo Print Cake',
 'Soft vanilla cake with an edible photo print on top. Upload any photo — perfect for personalised gifts.',
 1199,
 (SELECT id FROM public.categories WHERE name = 'Special'),
 true, false, null),

-- Chocolate cakes
('Belgian Dark Truffle',
 'Intensely chocolatey cake made with premium Belgian cocoa, filled with dark chocolate truffle cream and topped with cocoa dusting.',
 1399,
 (SELECT id FROM public.categories WHERE name = 'Chocolate'),
 true, true, null),

('Molten Choco Lava',
 'Warm chocolate cake with a gooey molten centre. Served individually and best enjoyed warm with a scoop of ice cream.',
 749,
 (SELECT id FROM public.categories WHERE name = 'Chocolate'),
 true, false, null),

-- Fruit cakes
('Mango Tango Delight',
 'Light chiffon cake layered with fresh Alphonso mango cream and topped with mango mirror glaze. India''s favourite fruit, elevated.',
 1199,
 (SELECT id FROM public.categories WHERE name = 'Fruit'),
 true, true, null),

('Mixed Berry Pavlova',
 'Crisp meringue base topped with vanilla whipped cream and a medley of fresh blueberries, raspberries, and sliced kiwi.',
 1099,
 (SELECT id FROM public.categories WHERE name = 'Fruit'),
 true, false, null)

ON CONFLICT DO NOTHING;

-- =============================================================
-- PRODUCT SIZES  (3 sizes per product using price multipliers)
-- =============================================================
INSERT INTO public.product_sizes (product_id, size_name, weight, price_multiplier)
SELECT p.id, s.size_name, s.weight, s.price_multiplier
FROM public.products p
CROSS JOIN (VALUES
  ('Small (500g)',  '500g',  1.00),
  ('Medium (1kg)',  '1kg',   1.60),
  ('Large (2kg)',   '2kg',   2.50)
) AS s(size_name, weight, price_multiplier)
WHERE p.name NOT IN ('Classic White Elegance', 'Rustic Naked Wedding Cake', 'Molten Choco Lava')
ON CONFLICT DO NOTHING;

-- Wedding cakes have larger size tiers
INSERT INTO public.product_sizes (product_id, size_name, weight, price_multiplier)
SELECT p.id, s.size_name, s.weight, s.price_multiplier
FROM public.products p
CROSS JOIN (VALUES
  ('2-Tier (2kg)',  '2kg',  1.00),
  ('3-Tier (4kg)',  '4kg',  1.60),
  ('4-Tier (6kg)',  '6kg',  2.20)
) AS s(size_name, weight, price_multiplier)
WHERE p.name IN ('Classic White Elegance', 'Rustic Naked Wedding Cake')
ON CONFLICT DO NOTHING;

-- Lava cake is individual portion only
INSERT INTO public.product_sizes (product_id, size_name, weight, price_multiplier)
SELECT p.id, s.size_name, s.weight, s.price_multiplier
FROM public.products p
CROSS JOIN (VALUES
  ('Single Serve', '120g', 1.00),
  ('Pack of 4',    '480g', 3.60),
  ('Pack of 6',    '720g', 5.00)
) AS s(size_name, weight, price_multiplier)
WHERE p.name = 'Molten Choco Lava'
ON CONFLICT DO NOTHING;

-- =============================================================
-- COUPONS
-- =============================================================
INSERT INTO public.coupons
  (code, description, discount_type, discount_value, is_active, is_first_time_only,
   max_uses, max_uses_per_user, min_order_amount, expires_at)
VALUES
  ('WELCOME10',
   '10% off your first order — welcome to Frostique!',
   'percentage', 10, true, true,
   500, 1, 500, '2027-12-31 23:59:59+00'),

  ('FLAT200',
   'Flat ₹200 off on orders above ₹1500.',
   'fixed', 200, true, false,
   200, 2, 1500, '2027-06-30 23:59:59+00'),

  ('CHOCO15',
   '15% off on all Chocolate category cakes.',
   'percentage', 15, true, false,
   100, 3, 800, '2026-12-31 23:59:59+00'),

  ('WEDDING500',
   'Special ₹500 off on wedding cake orders.',
   'fixed', 500, true, false,
   50, 1, 3000, '2027-12-31 23:59:59+00'),

  ('ANNIVERSARY20',
   '20% off on anniversary cakes — celebrate love!',
   'percentage', 20, true, false,
   75, 1, 1000, '2026-12-31 23:59:59+00'),

  ('FROSTIQUE50',
   'Flat ₹50 off on any order — a small sweet surprise.',
   'fixed', 50, true, false,
   1000, 5, 299, '2026-09-30 23:59:59+00')

ON CONFLICT (code) DO NOTHING;

-- =============================================================
-- CUSTOMER QUERIES  (sample contact form submissions)
-- =============================================================
INSERT INTO public.customer_queries (name, email, phone, message, status) VALUES
  ('Priya Sharma',
   'priya.sharma@gmail.com', '9876543210',
   'Hi, I would like to order a custom 3-tier wedding cake for 200 guests. Can you share pricing and delivery options for Pune?',
   'PENDING'),

  ('Rahul Mehta',
   'rahul.mehta@outlook.com', '9123456789',
   'I ordered the Chocolate Birthday Delight last week and it was absolutely amazing! The ganache was perfect. Will definitely order again.',
   'RESOLVED'),

  ('Anjali Patel',
   'anjali.p@yahoo.com', '9988776655',
   'Do you offer eggless options for the Red Velvet Romance cake? My family is vegetarian and we have an anniversary coming up.',
   'IN_PROGRESS'),

  ('Suresh Kumar',
   null, '9871234560',
   'What is the minimum advance time required to place a custom order? I need a cake for this Saturday.',
   'PENDING'),

  ('Meena Iyer',
   'meena.iyer@gmail.com', '9765432109',
   'The Mango Tango Delight I ordered was heavenly! However, the delivery was 30 minutes late. Please look into this.',
   'RESOLVED'),

  ('Vikram Singh',
   'vikram.s@hotmail.com', '9654321098',
   'Can I get a photo cake with my parents'' anniversary photo? Also, what edible printing quality do you use?',
   'PENDING')

ON CONFLICT DO NOTHING;

-- =============================================================
-- CUSTOMERS  (admin-managed records)
-- =============================================================
INSERT INTO public.customers (name, phone, email, address) VALUES
  ('Priya Sharma',   '9876543210', 'priya.sharma@gmail.com',  'Flat 4B, Koregaon Park, Pune - 411001'),
  ('Rahul Mehta',    '9123456789', 'rahul.mehta@outlook.com', '12, Juhu Tara Road, Mumbai - 400049'),
  ('Anjali Patel',   '9988776655', 'anjali.p@yahoo.com',      '78, Vastrapur, Ahmedabad - 380015'),
  ('Suresh Kumar',   '9871234560', null,                      'HSR Layout, Bengaluru - 560102'),
  ('Meena Iyer',     '9765432109', 'meena.iyer@gmail.com',    '23, Nungambakkam, Chennai - 600034'),
  ('Vikram Singh',   '9654321098', 'vikram.s@hotmail.com',    'Sector 18, Noida - 201301')
ON CONFLICT DO NOTHING;
