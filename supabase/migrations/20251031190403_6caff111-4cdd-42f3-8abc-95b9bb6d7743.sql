-- Add admin role to arbaj897ansari@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('eb2ded12-616b-4f5a-8c57-113336cda387', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;