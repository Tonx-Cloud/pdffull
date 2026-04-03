-- =============================================
-- PDFfULL — Migration 004: Delete policy + terms accepted
-- =============================================

-- Permitir que usuários excluam suas próprias conversões
create policy "Users can delete own conversions"
  on public.conversions for delete
  using (auth.uid() = user_id);
