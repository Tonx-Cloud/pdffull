-- Permitir que usuários autenticados façam upload no bucket pdfs
-- (necessário para upload direto do client, evitando limite 4.5MB serverless)

CREATE POLICY "Authenticated users can upload PDFs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pdfs');

-- Permitir leitura pública (bucket já é público)
CREATE POLICY "Public read access for PDFs"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'pdfs');
