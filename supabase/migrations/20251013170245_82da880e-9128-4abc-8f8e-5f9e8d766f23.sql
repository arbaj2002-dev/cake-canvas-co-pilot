-- Drop the existing foreign key constraint that references customers table
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;

-- Make customer_id nullable to support both authenticated and guest orders
ALTER TABLE public.orders
ALTER COLUMN customer_id DROP NOT NULL;

-- Add a new foreign key that references auth.users for authenticated orders
-- This will be NULL for guest orders
ALTER TABLE public.orders
ADD CONSTRAINT orders_customer_id_fkey 
FOREIGN KEY (customer_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;