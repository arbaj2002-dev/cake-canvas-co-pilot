# Database Setup Instructions

Your orders feature requires database tables that need to be created. Follow these steps:

## Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: `kftgoeeqjbxflktgkgdy`
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"

## Step 2: Run the Migration

Copy and paste the SQL from the file:
`supabase/migrations/20250101000000_create_base_schema.sql`

into the SQL editor and click "Run".

This will create all necessary tables:
- categories
- products
- product_sizes
- addons
- customers
- orders
- order_items
- order_addons

## Step 3: Verify Tables Were Created

After running the migration, you should see these new tables in your database.

You can verify by running:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

## What This Enables

Once the tables are created:
- ✅ Users can place orders through the checkout page
- ✅ Orders will be saved to the database with user_id
- ✅ The Profile page "My Orders" tab will show real orders
- ✅ No more mock data - everything will be real

## Troubleshooting

If you get errors about tables already existing, that's okay! It means some tables were already created. The migration uses `CREATE TABLE IF NOT EXISTS` to handle this safely.

If you see RLS policy errors, you can ignore them - the migration will recreate the policies.
