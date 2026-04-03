# 📋 KANBAN GERAL — PDFfULL

> **Criado:** 02/04/2026 | **Produto:** PDFfULL — Conversor Instantâneo de PDF  
> **Stack:** Next.js 16 + React 19 + Tailwind v4 + Supabase + Cloudflare R2 + Mercado Pago  
> **Deploy:** www.pdf-full.com (Vercel) | Domínio: PDF-FULL.COM (Cloudflare)  
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
| **FASE 5** | 5 | � | Publicação nas Lojas |
| **FASE 6** | 8 | ✅ | Compartilhar, Excluir, IA & Emails |
| **FASE 7** | 7 | ✅ | Bugfixes, Storage, FAQ & Docs |
| **FASE 8** | 5 | ✅ | Bugfixes Produção (Upload, Share, Email) |
| **FASE 9** | 6 | ✅ | Freemium sem Login + PWA + Rename |
| **FASE 10** | 5 | ✅ | OCR, Edição Inteligente & Leitor PDF |
| **FASE 11** | 7 | ✅ | UX Bugs, Merge PDFs, Hamburger, i18n |
| **FASE 12** | 4 | ✅ | Domínio Customizado (pdf-full.com) |
| **FASE 13** | 3 | ✅ | Testes E2E Produção (Playwright) |
| **TOTAL** | **95** | ✅ | Do setup ao lançamento |

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
> **Entrega:** App publicado em www.pdf-full.com com landing page e SEO

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 4.1 | ✅ | **Landing Page** — Página `/` com hero, benefícios, demonstração visual, planos/preços, CTA de cadastro, footer |
| 4.2 | ✅ | **SEO & Meta Tags** — Open Graph, Twitter Card, favicon, sitemap.xml, robots.txt |
| 4.3 | ✅ | **Analytics** — Integrar Vercel Analytics ou Google Analytics para métricas de uso |
| 4.4 | ✅ | **Páginas legais** — Termos de Uso, Política de Privacidade (obrigatórios para SaaS e lojas) |
| 4.5 | ✅ | **Testes E2E** — Playwright: 48 specs (landing, auth, converter, navegação, páginas legais, dashboard redirect) |
| 4.6 | ✅ | **Deploy Vercel** — Conectar repo GitHub, configurar variáveis de ambiente, deploy em `www.pdf-full.com` |
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
| 5.1 | ✅ | **Configurar Bubblewrap** — CLI instalado, projeto TWA inicializado, keystore gerado (SHA-256: `06:19:80:32:DA:...`), assetlinks.json atualizado com fingerprint real |
| 5.2 | ✅ | **Digital Asset Links** — `/.well-known/assetlinks.json` configurado com fingerprint real do keystore |
| 5.3 | ✅ | **Assets da loja** — Ícone 512x512, 10 screenshots Playwright, feature graphic 1024x500, descrição curta/longa em `docs/play-store-listing.md` |
| 5.4 | ✅ | **Build Android** — APK assinado (`dist/pdffull-1.0.0.apk`, 1MB) + AAB (`dist/pdffull-1.0.0.aab`, 1.1MB) gerados via Gradle. Pronto para upload na Play Console |
| 5.5 | 🔲 | **iOS (futuro)** — Avaliar Capacitor para empacotamento iOS, criar conta Apple Developer ($99/ano) |

---

## FASE 6 — Compartilhar, Excluir, IA & Emails

> **Objetivo:** Adicionar ações avançadas nos PDFs (compartilhar, excluir, análise IA) e emails transacionais  
> **Pré-requisito:** Fases 0-4.9 concluídas  
> **Entrega:** Botões de compartilhar (WhatsApp/Email/SMS), excluir, análise IA com Gemini, e emails de boas-vindas

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 6.1 | ✅ | **Share Menu** — Componente dropdown com opções WhatsApp, Email, SMS (abre app nativo com link do PDF) + Web Share API (mobile file sharing) |
| 6.2 | ✅ | **Botão Excluir** — API `DELETE /api/conversions/[id]` com RLS. Remove do banco e R2. Botão no histórico com confirmação |
| 6.3 | ✅ | **Histórico Interativo** — Converter para client component com seleção múltipla, ações em lote (compartilhar/excluir vários), botões por item |
| 6.4 | ✅ | **API Análise IA** — `POST /api/analyze` envia PDF (base64) ao Gemini 2.5 Flash. Retorna análise textual + streaming para chat |
| 6.5 | ✅ | **Modal Análise IA** — Dialog com análise inicial do PDF + campo de chat para perguntas follow-up sobre o documento |
| 6.6 | ✅ | **Emails Transacionais (Resend)** — Configurar Resend. Email de boas-vindas + notificação de upgrade Pro |
| 6.7 | ✅ | **Organizar raiz** — Mover `ideia_inicial.md` para `docs/`. Limpar arquivos desnecessários. Criar `.env.example` |
| 6.8 | ✅ | **Atualizar README** — README personalizado com descrição, features, stack, setup local, deploy |

---

## FASE 7 — Bugfixes, Storage, FAQ & Documentação

> **Objetivo:** Corrigir bugs de produção, adicionar storage fallback, criar FAQ e documentação  
> **Pré-requisito:** Fase 6 concluída  
> **Entrega:** Bugs corrigidos, PDFs na nuvem (Supabase Storage), FAQ completo, tutorial com prints

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 7.1 | ✅ | **Fix Card overflow** — Card do shadcn v4 tinha `overflow-hidden` cortando dropdown de compartilhamento. Adicionado `overflow-visible` no Card do pdf-result |
| 7.2 | ✅ | **Fix Análise IA** — Modelo corrigido para `gemini-2.0-flash`, API key com `.trim()`, URL lazy-loaded, base64 chunked (8KB chunks), limite 10MB |
| 7.3 | ✅ | **Fix Share** — Emoji removido (garbled no WhatsApp), `mailto:` e `sms:` agora usam `<a>.click()` em vez de `window.open` |
| 7.4 | ✅ | **Polling de créditos** — Hook `useConversionLimit` agora faz polling a cada 30s + refetch no foco da aba (visibilitychange) |
| 7.5 | ✅ | **Supabase Storage fallback** — Quando R2 não está configurado, PDFs são salvos no Supabase Storage (bucket público `pdfs`). URLs reais permitem download e análise IA no histórico |
| 7.6 | ✅ | **Página FAQ** — `/faq` com 5 seções accordion (Uso Geral, Planos, Funcionalidades, Privacidade, Problemas). Link no footer da landing |
| 7.7 | ✅ | **Documentação FAQ** — `docs/faq.md` completo com uso, planos, IA, compartilhamento, segurança, LGPD, stack e problemas comuns |

---

## FASE 8 — Bugfixes Produção (Upload, Share, Email)

> **Objetivo:** Corrigir bugs reportados em produção: 413 no upload, caractere especial no WhatsApp, email abrindo página em branco  
> **Pré-requisito:** Fase 7 concluída  
> **Entrega:** Upload sem limite de 4.5MB, compartilhamento limpo, mailto funcional

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 8.1 | ✅ | **Fix 413 Content Too Large** — Upload via signed URL do Supabase Storage (bypassa limite 4.5MB serverless). Nova rota `/api/upload/signed-url` gera URL assinada, client faz upload direto. `/api/conversions/register` registra metadata sem enviar arquivo |
| 8.2 | ✅ | **Fix WhatsApp caractere especial** — Sanitizar filename no shareText removendo caracteres Unicode problemáticos (◆, emojis, em-dash). Regex `[^\x20-\x7E\u00C0-\u00FF]` preserva ASCII + acentos pt-BR |
| 8.3 | ✅ | **Fix Email blank page** — Substituir `<a>.click()` por `window.location.href` para mailto. SMS agora usa `window.open(_self)` para compatibilidade |
| 8.4 | ✅ | **Compressão otimizada** — `maxSizeMB` de 1→0.8, threshold de 1MB→800KB, validação de formatos suportados com mensagem amigável |
| 8.5 | ✅ | **RLS Storage policy** — Migration `005_storage_upload_policy.sql`: INSERT para authenticated + SELECT público no bucket `pdfs` |

---

## FASE 9 — Freemium sem Login + PWA + Rename

> **Objetivo:** Permitir conversões sem login obrigatório, adicionar botões PWA e renomear PDF  
> **Pré-requisito:** Fase 8 concluída  
> **Entrega:** Converter acessível sem login, botões instalar/compartilhar PWA, rename de PDF

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 9.1 | ✅ | **Converter sem login** — Remover `/converter` das rotas protegidas no middleware. Modo anônimo: conversão local sem upload. Limite via localStorage (2/mês). Logado: fluxo normal com upload |
| 9.2 | ✅ | **CTA "Cadastre grátis"** — Após conversão anônima, exibir banner "Crie conta grátis e ganhe +3 conversões". Após limite anônimo esgotado, modal convida cadastro |
| 9.3 | ✅ | **Botão "Instalar App"** — Componente `PwaInstallButton` usando `beforeinstallprompt`. Exibido na landing, converter e dashboard header |
| 9.4 | ✅ | **Botão "Compartilhar App"** — Componente `PwaShareButton` usando `navigator.share`. Compartilha URL + descrição do PDFfULL |
| 9.5 | ✅ | **Renomear PDF** — Input editável no PdfResult (antes do upload) + botão rename no histórico com PATCH na API |
| 9.6 | ✅ | **Atualizar landing page** — Corrigir texto "Sem cadastro necessário" → "2 conversões sem cadastro", adicionar botões PWA |

---

## FASE 10 — OCR, Edição Inteligente & Leitor PDF

> **Objetivo:** Extrair texto de imagens via IA, permitir edição em Markdown e visualizar PDFs  
> **Pré-requisito:** Fase 9 concluída  
> **Entrega:** OCR funcional, editor Markdown com preview, leitor PDF integrado

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 10.1 | ✅ | **OCR via Gemini** — Endpoint `/api/ocr` recebe imagem e retorna texto extraído via Gemini 2.0 Flash. Botão "Extrair Texto" no converter |
| 10.2 | ✅ | **Editor Markdown** — Modal com textarea para editar texto extraído do OCR. Preview lado a lado com formatação |
| 10.3 | ✅ | **Markdown → PDF** — Converter texto Markdown editado para PDF formatado usando jsPDF com estilos |
| 10.4 | ✅ | **Integrar no Modal IA** — Unificar OCR, edição e análise no modal de IA. Abas: "Análise" / "Extrair Texto" |
| 10.5 | ✅ | **Leitor PDF integrado** — Componente viewer com iframe para abrir PDFs dentro do app. Botão "Visualizar PDF" no histórico e no resultado |

---

## FASE 11 — UX Bugs, Merge PDFs, Hamburger Menu & i18n

> **Objetivo:** Corrigir bugs de UX, adicionar merge de PDFs, menu responsivo e internacionalização  
> **Pré-requisito:** Fase 10 concluída  
> **Entrega:** Layout corrigido, merge funcional, hamburger menu, 6 idiomas com RTL

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 11.1 | ✅ | **Fix layout histórico** — Card agora usa 2 linhas: título em cima, botões embaixo. Corrige sobreposição de botões no mobile |
| 11.2 | ✅ | **Juntar PDFs** — Botão "Merge" na ação em lote do histórico usando `pdf-lib` client-side. Selecionar N PDFs → 1 PDF unificado |
| 11.3 | ✅ | **Fix PDF Viewer** — Reescrito com `useRef` para ciclo de vida de blob URLs. Fetch remoto como blob antes de exibir |
| 11.4 | ✅ | **Performance** — Removido `force-dynamic` do layout. Imports dinâmicos (`dynamic()`) para modais pesados |
| 11.5 | ✅ | **Hamburger menu** — Menu mobile colapsável com dropdown. Desktop mantém nav inline. Inclui LanguageSelector e PwaInstallButton |
| 11.6 | ✅ | **i18n (next-intl)** — 6 idiomas (pt, en, es, zh, hi, ar) sem prefixo de URL. Detecção via cookie → Accept-Language → fallback pt |
| 11.7 | ✅ | **RTL Support** — Suporte a direção right-to-left para árabe. `dir="rtl"` dinâmico no html |

---

## FASE 12 — Domínio Customizado (pdf-full.com)

> **Objetivo:** Configurar domínio próprio PDF-FULL.COM registrado via Cloudflare  
> **Pré-requisito:** Fase 11 concluída  
> **Entrega:** App acessível em www.pdf-full.com com SSL, DNS e redirects configurados

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 12.1 | ✅ | **Registro do domínio** — PDF-FULL.COM registrado via Cloudflare Registrar. NS: rick.ns.cloudflare.com + veda.ns.cloudflare.com |
| 12.2 | ✅ | **Atualizar URLs no código** — Substituir todas as referências `pdffull.vercel.app` → `www.pdf-full.com` em layout, sitemap, robots, emails, FAQ, termos, TWA |
| 12.3 | ✅ | **Atualizar documentação** — Kanban, FAQ, Guia TWA, Visão Geral atualizados para novo domínio |
| 12.4 | ✅ | **Configurar Vercel + Cloudflare DNS** — Domínios `pdf-full.com` e `www.pdf-full.com` adicionados ao Vercel. A record `@ → 76.76.21.21`, CNAME `www → cname.vercel-dns.com` no Cloudflare. SSL ativo. |

---

## FASE 13 — Testes E2E Produção (Playwright)

> **Objetivo:** Suite E2E completa contra produção www.pdf-full.com
> **Pré-requisito:** Fase 12 concluída (domínio ativo)
> **Entrega:** 50 testes verdes cobrindo todos os fluxos do usuário

| # | Tarefa | Detalhes | Status |
|---|--------|----------|:------:|
| 13.1 | ✅ | **Suite E2E produção** — 50 testes em `tests/production-e2e.spec.ts` cobrindo: Landing (hero, header, features, planos, footer, i18n selector), Login (form, OAuth, magic link, links), Register (checkbox termos, habilitação botões, links), Converter anônimo, Rotas protegidas (redirect /login), FAQ (seções, accordions), Sobre, Termos, Privacidade (LGPD), Fluxos multi-page, Domínio/SSL/headers, Mobile hamburger |
| 13.2 | ✅ | **Config produção Playwright** — `playwright.production.config.ts` sem webServer, baseURL `https://www.pdf-full.com`, 3 workers, retry 1 |
| 13.3 | ✅ | **Resultado: 50/50 passed** — 16.2s, zero flaky, cobertura: 13 describe blocks, 12 páginas/fluxos testados |

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
- **Polling a cada 30s** + refetch no foco da aba para sincronização entre dispositivos

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
- **Upload via Signed URL** (Fase 8): PDFs são uploaded diretamente do client ao Supabase Storage via signed URL gerada pelo server (service_role), evitando o limite de 4.5MB do body das serverless functions da Vercel
- **Fallback Supabase Storage**: Quando R2 não configurado, PDFs são salvos no Supabase Storage (bucket público `pdfs`, 1GB free tier) com URLs reais
