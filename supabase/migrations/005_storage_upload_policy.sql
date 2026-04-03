-- Permitir que usuários autenticados façam upload no bucket pdfs
-- (necessário para upload direto do client, evitando limite 4.5MB serverless)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload PDFs' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Authenticated users can upload PDFs"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'pdfs');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for PDFs' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public read access for PDFs"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'pdfs');
  END IF;
END
$$;
