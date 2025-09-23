-- Add customer queries table
CREATE TABLE public.customer_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_queries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create queries" 
ON public.customer_queries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Queries viewable by everyone" 
ON public.customer_queries 
FOR SELECT 
USING (true);

-- Add trigger for timestamps
CREATE TRIGGER update_customer_queries_updated_at
BEFORE UPDATE ON public.customer_queries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample products
INSERT INTO public.categories (name, description) VALUES 
('Birthday', 'Perfect cakes for birthday celebrations'),
('Wedding', 'Elegant wedding cakes'),
('Special', 'Special occasion cakes'),
('Chocolate', 'Rich chocolate cakes');

INSERT INTO public.products (name, description, base_price, category_id, image_url, is_featured, is_active) VALUES 
('Chocolate Birthday Delight', 'Rich chocolate cake perfect for birthday celebrations', 899, (SELECT id FROM categories WHERE name = 'Birthday'), '/src/assets/hero-cake.jpg', true, true),
('Elegant Wedding Cake', 'Three-tier vanilla wedding cake with rose decorations', 2499, (SELECT id FROM categories WHERE name = 'Wedding'), '/src/assets/wedding-cake.jpg', true, true),
('Rainbow Layer Cake', 'Colorful rainbow layers that bring joy to any celebration', 1299, (SELECT id FROM categories WHERE name = 'Special'), '/src/assets/rainbow-cake.jpg', true, true),
('Classic Chocolate Cake', 'Traditional chocolate cake with rich frosting', 1199, (SELECT id FROM categories WHERE name = 'Chocolate'), '/src/assets/chocolate-cake.jpg', false, true);

-- Insert some addons
INSERT INTO public.addons (name, description, price, type, is_active) VALUES 
('Birthday Candles Set', 'Set of colorful birthday candles', 50, 'decoration', true),
('Heart Balloons', 'Pack of heart-shaped balloons', 100, 'decoration', true),
('Chocolate Sticks', 'Decorative chocolate sticks', 75, 'topping', true),
('Fresh Strawberries', 'Fresh strawberry topping', 150, 'topping', true),
('Custom Message Card', 'Personalized message card', 25, 'extras', true);

-- Insert product sizes
INSERT INTO public.product_sizes (product_id, size_name, weight, price_multiplier) VALUES 
((SELECT id FROM products WHERE name = 'Chocolate Birthday Delight'), 'Small (500g)', '500g', 1.0),
((SELECT id FROM products WHERE name = 'Chocolate Birthday Delight'), 'Medium (1kg)', '1kg', 1.5),
((SELECT id FROM products WHERE name = 'Chocolate Birthday Delight'), 'Large (1.5kg)', '1.5kg', 2.0),
((SELECT id FROM products WHERE name = 'Elegant Wedding Cake'), 'Medium (2kg)', '2kg', 1.0),
((SELECT id FROM products WHERE name = 'Elegant Wedding Cake'), 'Large (3kg)', '3kg', 1.3),
((SELECT id FROM products WHERE name = 'Rainbow Layer Cake'), 'Small (500g)', '500g', 1.0),
((SELECT id FROM products WHERE name = 'Rainbow Layer Cake'), 'Medium (1kg)', '1kg', 1.4),
((SELECT id FROM products WHERE name = 'Classic Chocolate Cake'), 'Small (500g)', '500g', 1.0),
((SELECT id FROM products WHERE name = 'Classic Chocolate Cake'), 'Medium (1kg)', '1kg', 1.5);