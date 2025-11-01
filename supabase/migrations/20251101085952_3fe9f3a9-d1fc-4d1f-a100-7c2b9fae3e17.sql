-- Create storage bucket for cake images
INSERT INTO storage.buckets (id, name, public)
VALUES ('cakes', 'cakes', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for cake images bucket
CREATE POLICY "Anyone can view cake images"
ON storage.objects FOR SELECT
USING (bucket_id = 'cakes');

CREATE POLICY "Admins can upload cake images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cakes' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update cake images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cakes' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete cake images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cakes' AND
  public.has_role(auth.uid(), 'admin')
);