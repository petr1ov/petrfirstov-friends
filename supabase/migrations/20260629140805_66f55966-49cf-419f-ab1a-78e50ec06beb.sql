
DO $$ BEGIN
  CREATE POLICY "case-gallery read" ON storage.objects FOR SELECT USING (bucket_id = 'case-gallery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "case-gallery insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'case-gallery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "case-gallery update" ON storage.objects FOR UPDATE USING (bucket_id = 'case-gallery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "case-gallery delete" ON storage.objects FOR DELETE USING (bucket_id = 'case-gallery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
