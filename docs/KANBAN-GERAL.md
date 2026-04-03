# 📋 KANBAN GERAL — PDFfULL

> **Criado:** 02/04/2026 | **Produto:** PDFfULL — Conversor Instantâneo de PDF  
> **Stack:** Next.js 14 + React + Tailwind + Supabase + Cloudflare R2 + Mercado Pago  
> **Deploy:** pdffull.vercel.app  
> **Documentação:** `docs/01-VISAO-GERAL-DO-PROJETO.md`

---

## Legenda

| Ícone | Significado |
|-------|-------------|
| ✅ | Concluído |
| 🔄 | Em progresso |
| 🔲 | Pendente |
| ⏸️ | Bloqueado |
| 🚫 | Cancelado / Descartado |

---

## Resumo das Fases

| Fase | Tarefas | Status | Descrição |
|------|:-------:|:------:|-----------|
| **FASE 0** | 8 | ✅ | Setup & Infraestrutura |
| **FASE 1** | 8 | ✅ | Core Engine (Conversão & UI) |
| **FASE 2** | 7 | ✅ | Auth & SaaS (Usuários & Limites) |
| **FASE 3** | 6 | ✅ | Monetização (Mercado Pago) |
| **FASE 4** | 7 | ✅ | Polish, Landing & Deploy |
| **FASE 4.8** | 3 | ✅ | Infra Produção (Supabase, Icons, OAuth) |
| **FASE 4.9** | 6 | ✅ | Hardening de Segurança |
| **FASE 5** | 5 | 🔲 | Publicação nas Lojas |
| **TOTAL** | **50** | 🔄 | Do setup ao lançamento |

---

## FASE 0 — Setup & Infraestrutura

> **Objetivo:** Criar a base do projeto, configurar ferramentas e serviços externos  
> **Pré-requisito:** Nenhum  
> **Entrega:** Projeto rodando localmente com estrutura de pastas, Supabase conectado, R2 pronto

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 0.1 | ✅ | **Inicializar projeto Next.js 14** — `npx create-next-app@latest pdffull --typescript --tailwind --app --src-dir` |
| 0.2 | ✅ | **Configurar shadcn/ui** — `npx shadcn-ui@latest init` + instalar componentes base (Button, Card, Dialog, Toast) |
| 0.3 | ✅ | **Criar projeto Supabase** — Novo projeto dedicado, anotar URL + chaves. Criar tabelas `profiles`, `conversions`, `subscriptions` com RLS |
| 0.4 | ✅ | **Configurar Supabase Client** — `@supabase/supabase-js` + `@supabase/ssr`, criar `lib/supabase/client.ts` e `lib/supabase/server.ts` |
| 0.5 | ✅ | **Configurar Cloudflare R2** — Criar bucket `pdffull-storage`, gerar Access Key, configurar CORS para upload direto |
| 0.6 | ✅ | **Configurar PWA** — Criar `manifest.json` com ícones, `next-pwa` ou Service Worker manual, meta tags para installable |
| 0.7 | ✅ | **Configurar `.env.local`** — Preencher variáveis a partir do `.env.example` (Supabase, R2, App URL) |
| 0.8 | ✅ | **Estrutura de pastas** — Criar diretórios: `(auth)`, `(dashboard)`, `api/`, `components/`, `lib/`, `hooks/`, `types/` |

---

## FASE 1 — Core Engine (Conversão & UI)

> **Objetivo:** Implementar o fluxo principal: capturar foto → comprimir → gerar PDF → download  
> **Pré-requisito:** Fase 0 concluída  
> **Entrega:** Usuário consegue tirar foto e baixar PDF otimizado, sem login necessário

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 1.1 | ✅ | **Componente de Câmera Nativa** — `<input type="file" accept="image/*" capture="environment" />` + fallback para galeria |
| 1.2 | ✅ | **Pipeline de Compressão** — Usar `browser-image-compression` (maxSizeMB: 1, maxWidthOrHeight: 1920), criar `lib/pdf/compress.ts` |
| 1.3 | ✅ | **Geração de PDF** — Usar `jsPDF` para converter imagem comprimida em PDF, ajustar proporções automaticamente, criar `lib/pdf/generate.ts` |
| 1.4 | ✅ | **Múltiplas fotos → 1 PDF** — Interface para adicionar várias fotos, reordenar (drag & drop), remover, gerar PDF multi-página |
| 1.5 | ✅ | **Preview do PDF** — Componente `pdf-preview.tsx` para visualizar antes de baixar/compartilhar |
| 1.6 | ✅ | **Download direto** — Botão para salvar PDF no dispositivo via `URL.createObjectURL()` |
| 1.7 | ✅ | **UI Minimalista** — Tela principal com botão central "CONVERTER", progress bar, resultado com ações (download, compartilhar) |
| 1.8 | ✅ | **Orientação automática** — Detectar se imagem é retrato/paisagem e ajustar página do PDF correspondente |

---

## FASE 2 — Auth & SaaS (Usuários & Limites)

> **Objetivo:** Adicionar autenticação, perfis de usuário e controle de limites do plano  
> **Pré-requisito:** Fase 1 concluída (conversão funcionando sem login)  
> **Entrega:** Usuário cria conta, tem histórico, e o plano Free limita a 5 conversões/mês

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 2.1 | ✅ | **Supabase Auth** — Configurar Google OAuth + Magic Link (email). Páginas `/login` e `/register` |
| 2.2 | ✅ | **Middleware de Auth** — Proteger rotas `(dashboard)`, redirecionar para login se não autenticado |
| 2.3 | ✅ | **Trigger de Profile** — Função SQL `on_auth_user_created` para criar registro em `profiles` automaticamente |
| 2.4 | ✅ | **Histórico de Conversões** — Página `/historico` listando PDFs gerados com data, nome, tamanho, link de download |
| 2.5 | ✅ | **Upload para R2** — Após conversão (usuário logado), fazer upload do PDF para Cloudflare R2 via API Route `/api/upload` |
| 2.6 | ✅ | **Middleware de Limites** — Hook `use-conversion-limit.ts` que verifica `conversions_this_month` < 5 (Free) ou ilimitado (Pro). Bloquear com modal de upgrade |
| 2.7 | ✅ | **Página de Conta** — `/conta` com nome, email, plano atual, uso do mês (X/5), botão de upgrade |

---

## FASE 3 — Monetização (Mercado Pago)

> **Objetivo:** Integrar pagamentos para o plano Pro via Mercado Pago  
> **Pré-requisito:** Fase 2 concluída (auth + limites funcionando)  
> **Entrega:** Usuário Free consegue assinar o plano Pro e ter conversões ilimitadas  
> **Dependência externa:** Criar conta Mercado Pago Developers + aplicação

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 3.1 | ✅ | **Criar conta Mercado Pago** — Cadastrar em developers.mercadopago.com, criar aplicação, obter `ACCESS_TOKEN` e `PUBLIC_KEY` |
| 3.2 | ✅ | **API Route `/api/checkout`** — Gerar preferência de pagamento (Checkout Pro) com plano Pro R$9,90/mês, URLs de callback |
| 3.3 | ✅ | **Webhook `/api/webhooks/mercadopago`** — Receber notificações de pagamento, validar assinatura, atualizar `subscriptions` e `profiles.plan` no Supabase |
| 3.4 | ✅ | **Planos no banco** — Seed com configurações: Free (5/mês, grátis), Pro (ilimitado, R$9,90/mês) |
| 3.5 | ✅ | **Upgrade Flow na UI** — Modal/página de upgrade com benefícios do Pro, botão que redireciona para checkout MP |
| 3.6 | ✅ | **Cancelamento** — Página para cancelar assinatura, chamar API do MP para cancelar, atualizar status no banco |

---

## FASE 4 — Polish, Landing & Deploy

> **Objetivo:** Polir a experiência, criar landing page comercial e fazer deploy na Vercel  
> **Pré-requisito:** Fases 0-3 concluídas  
> **Entrega:** App publicado em pdffull.vercel.app com landing page e SEO

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 4.1 | ✅ | **Landing Page** — Página `/` com hero, benefícios, demonstração visual, planos/preços, CTA de cadastro, footer |
| 4.2 | ✅ | **SEO & Meta Tags** — Open Graph, Twitter Card, favicon, sitemap.xml, robots.txt |
| 4.3 | ✅ | **Analytics** — Integrar Vercel Analytics ou Google Analytics para métricas de uso |
| 4.4 | ✅ | **Páginas legais** — Termos de Uso, Política de Privacidade (obrigatórios para SaaS e lojas) |
| 4.5 | ✅ | **Testes E2E** — Playwright: 48 specs (landing, auth, converter, navegação, páginas legais, dashboard redirect) |
| 4.6 | ✅ | **Deploy Vercel** — Conectar repo GitHub, configurar variáveis de ambiente, deploy em `pdffull.vercel.app` |
| 4.7 | ✅ | **Reset mensal (CRON)** — Job agendado (Vercel Cron ou Supabase pg_cron) para resetar `conversions_this_month` todo dia 1 |

---

## FASE 4.8 — Infraestrutura de Produção

> **Objetivo:** Corrigir erros de produção, configurar serviços externos  
> **Pré-requisito:** Fase 4 concluída  
> **Entrega:** App funcionando sem erros 404/400 em produção

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 4.8.1 | ✅ | **Migration SQL Supabase** — Rodar `001_initial_schema.sql` no banco remoto (pooler `aws-1-us-west-2`). Tabelas: `profiles`, `conversions`, `subscriptions` com RLS |
| 4.8.2 | ✅ | **Ícones PWA & Favicon** — Gerar `icon-192x192.png`, `icon-512x512.png`, `icon-512-maskable.png` e `favicon.ico`. Corrigir manifest com purpose separado (`any` vs `maskable`) |
| 4.8.3 | ✅ | **Google OAuth no Supabase** — Provider Google configurado via CLI (`config push`). Client ID/Secret do Google Cloud. Magic Link habilitado |

---

## FASE 4.9 — Hardening de Segurança

> **Objetivo:** Blindar a aplicação contra ataques comuns (OWASP Top 10)  
> **Pré-requisito:** Fase 4.8 concluída  
> **Entrega:** Upload validado, headers seguros, webhook blindado, logs de auditoria

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 4.9.1 | ✅ | **Validação MIME Type no Upload** — Aceitar apenas `application/pdf`, `image/jpeg`, `image/png`, `image/webp`. Validar magic bytes para PDFs |
| 4.9.2 | ✅ | **Sanitização de Filename** — Remover caracteres especiais, limitar a 200 chars, prevenir path traversal |
| 4.9.3 | ✅ | **Security Headers** — `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy` (câmera self-only) |
| 4.9.4 | ✅ | **Webhook HMAC Validation** — Validar `x-signature` e `x-request-id` do Mercado Pago via HMAC SHA256. Rejeitar 401 se inválido |
| 4.9.5 | ✅ | **Tabela webhook_logs** — Migration 002: auditoria de todas as tentativas (processed/rejected/ignored/error) com IP, verificação e detalhes |
| 4.9.6 | ✅ | **RLS em webhook_logs** — RLS ativado sem policies = bloqueado para anon/authenticated, apenas service_role (admin) pode ler/escrever |

---

## FASE 5 — Publicação nas Lojas

> **Objetivo:** Publicar o PWA como app nativo na Google Play Store  
> **Pré-requisito:** Fase 4 concluída (app estável em produção)  
> **Entrega:** PDFfULL disponível para download na Play Store

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 5.1 | 🔲 | **Configurar Bubblewrap** — Instalar CLI, gerar projeto TWA apontando para `pdffull.vercel.app` |
| 5.2 | ✅ | **Digital Asset Links** — Criar `/.well-known/assetlinks.json` na Vercel para validar o app TWA |
| 5.3 | 🔄 | **Assets da loja** — Ícone 512x512 ✅, screenshots (celular + tablet) 🔲, descrição curta/longa 🔲, feature graphic 🔲 |
| 5.4 | 🔲 | **Upload Play Store** — Gerar `.aab`, criar listing no Google Play Console, enviar para revisão |
| 5.5 | 🔲 | **iOS (futuro)** — Avaliar Capacitor para empacotamento iOS, criar conta Apple Developer ($99/ano) |

---

## Notas Técnicas

### Conversão Client-Side
O processamento de imagem → PDF acontece **inteiramente no navegador** do usuário:
1. `browser-image-compression` reduz o tamanho da imagem
2. `jsPDF` gera o PDF com a imagem otimizada
3. O PDF é disponibilizado para download instantâneo
4. Upload para R2 só acontece se o usuário estiver logado (plano Pro)

**Benefício:** Zero custo de servidor para conversão. A Vercel só processa auth, webhooks e upload.

### Limites do Plano Free
- Contagem feita no banco (`profiles.conversions_this_month`)
- Incrementado a cada conversão bem-sucedida
- Reset automático via CRON no dia 1 de cada mês
- Sem login = sem contagem (mas também sem histórico/upload)

### Segurança (Fase 4.9 — Hardening)
- Chaves privadas (`SUPABASE_SERVICE_ROLE_KEY`, `MP_ACCESS_TOKEN`, `R2_SECRET_ACCESS_KEY`) **nunca** expostas no client
- Prefixo `NEXT_PUBLIC_` apenas para chaves públicas
- RLS ativo em **todas** as tabelas do Supabase (profiles, conversions, subscriptions, webhook_logs)
- Webhook do Mercado Pago validado via **assinatura HMAC SHA256** (`x-signature` + `x-request-id`)
- Upload valida **MIME type** (image/jpeg, image/png, image/webp, application/pdf) e **magic bytes** para PDFs
- **Filename sanitizado**: caracteres especiais removidos, máx 200 chars, previne path traversal
- **Security headers**: X-Content-Type-Options nosniff, X-Frame-Options DENY, HSTS, Referrer-Policy, Permissions-Policy
- **Tabela webhook_logs**: auditoria completa de todas as tentativas de webhook com IP, status e detalhes
- Upload para R2 via API Route (server-side), nunca direto do client
