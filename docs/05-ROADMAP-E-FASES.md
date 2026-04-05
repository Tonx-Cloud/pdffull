# PDFfULL — Roadmap e Fases

> **Atualizado:** 05/04/2026

---

## Fases Concluídas

### FASE 0 — Setup & Infra ✅
- Repositório Git privado (Tonx-Cloud/pdffull)
- Next.js 16 + Tailwind v4 + shadcn/ui v4
- Supabase configurado (auth, DB, RLS, migrations)
- Vercel deploy + domínio pdf-full.com
- Cloudflare DNS (A + CNAME)
- Estrutura de pastas padrão
- AGENTS.md + CLAUDE.md

### FASE 1 — Core (MVP) ✅
- Auth (Google OAuth via Supabase)
- Conversor de fotos → PDF (câmera + galeria)
- Compressão de imagens
- Upload para R2
- Histórico de conversões
- Página de conta

### FASE 2 — Produção & Web ✅
- PWA (manifest, service worker, offline)
- Landing page
- SEO (robots.ts, sitemap.ts, meta tags)
- Vercel Analytics
- Security headers (6 headers)
- Deploy produção em pdf-full.com

### FASE 3 — Publicação Android ✅
- TWA (Bubblewrap) → .aab
- Play Store listing & assets
- assetlinks.json

### Fases Extras Concluídas ✅
- **Fase 4**: Segurança (CSP, HMAC webhook, rate limit, sanitize)
- **Fase 5**: Compartilhamento (WhatsApp, Email, Web Share API)
- **Fase 6**: Exclusão de conversões (com cleanup R2)
- **Fase 7**: IA (Gemini análise, OCR, chat sobre PDF)
- **Fase 8**: Emails transacionais (Resend)
- **Fase 9**: PWA install/share buttons
- **Fase 10**: Rename PDF, PDF viewer
- **Fase 11**: i18n 6 idiomas, bugs UX, merge PDFs
- **Fase 12**: Domínio pdf-full.com
- **Fase 13**: 50 testes E2E Playwright

---

## Em Progresso

### FASE 14 — Refatoração GENESIS + Mercado Pago 🔄
- Instalação Zod + Zustand
- Middleware raiz
- CSP header
- Rate limiting + sanitização de prompts
- Zod validation em todas API routes
- Reorganização components em módulos
- Reorganização scripts em subpastas
- Zustand store
- Docs obrigatórios (02-05)
- READMEs internos
- Credenciais MP produção
- Webhook secret MP

---

## Futuro

- [ ] Google Ads / campanhas de tráfego
- [ ] iOS (Capacitor → App Store)
- [ ] Dashboard analytics para admin
- [ ] Batch conversion (múltiplos PDFs de uma vez)
