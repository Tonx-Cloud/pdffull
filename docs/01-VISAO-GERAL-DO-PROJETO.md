# PDFfULL — Conversor Instantâneo de PDF
## Visão Geral do Projeto

> **Criado:** 02/04/2026 | **Status:** Fase 0 — Setup Inicial  
> **Stack:** Next.js 14 (App Router) + React + Tailwind CSS + Supabase + Cloudflare R2 + Mercado Pago  
> **Deploy:** www.pdf-full.com (Vercel)

---

## 1. O que é o projeto

PWA (Progressive Web App) SaaS focado em **conversão instantânea de fotos em PDF otimizado**. O usuário acessa pelo celular, tira uma foto (ou carrega da galeria), e a aplicação gera um PDF comprimido pronto para compartilhamento via link ou download — tudo em **um clique**.

| Frente | Objetivo | Status |
|--------|----------|--------|
| **PWA (www.pdf-full.com)** | App completo com captura, conversão e compartilhamento | 🔲 Fase 0 |
| **Landing Page** | Site comercial, captação de leads | 🔲 Fase 4 |
| **App Android (Play Store)** | Publicação oficial via TWA | 🔲 Fase 5 |
| **App iOS (App Store)** | Publicação via Capacitor | 🔲 Futuro |

---

## 2. Público-alvo (Personas)

### Persona 1 — Usuário Casual (Maria)
- Precisa converter uma foto de documento para PDF rapidamente
- Não quer instalar apps pesados ou criar conta
- Usa o celular como ferramenta principal
- **Plano:** Free (5 conversões/mês)

### Persona 2 — Profissional (Carlos)
- Corretor, vendedor, autônomo que digitaliza documentos diariamente
- Precisa de histórico de conversões e múltiplas fotos em 1 PDF
- Valoriza rapidez e organização
- **Plano:** Pro (ilimitado)

### Persona 3 — Estudante (Ana)
- Fotografa anotações, provas, apostilas para converter em PDF
- Precisa juntar várias fotos em um único arquivo
- Orçamento limitado, sensível a preço
- **Plano:** Free → Pro quando necessário

### Persona 4 — Pequena Empresa (João)
- Digitaliza notas fiscais, recibos, contratos
- Precisa de confiabilidade e armazenamento
- Quer solução simples sem treinamento
- **Plano:** Pro

---

## 3. Pilares do Produto

### Pilar 1 — Captura
- Acesso direto à câmera do celular via navegador
- Upload da galeria (JPG, PNG, HEIC)
- Múltiplas fotos em sequência

### Pilar 2 — Conversão
- Compressão inteligente de imagem (browser-image-compression)
- Geração de PDF no lado do cliente (jsPDF / pdf-lib)
- Múltiplas imagens → 1 PDF multi-página
- Orientação automática (retrato/paisagem)

### Pilar 3 — Compartilhamento
- Download direto do PDF
- Link de compartilhamento temporário (Cloudflare R2)
- Compartilhar via WhatsApp, Email, etc. (Web Share API)

### Pilar 4 — SaaS & Monetização
- Autenticação via Supabase (Google, Email/Magic Link)
- Histórico de conversões por usuário
- Limites por plano (Free: 5/mês, Pro: ilimitado)
- Checkout via Mercado Pago (Checkout Pro)

### Pilar 5 — PWA & Offline
- Instalável na tela inicial do celular
- Service Worker para cache de assets
- Conversão funciona offline (processamento client-side)
- Sincronização de upload quando reconectar

---

## 4. Stack Técnica

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Frontend** | Next.js 14 (App Router), React, TypeScript | SSR, rotas API, performance |
| **Estilização** | Tailwind CSS, shadcn/ui | UI minimalista e responsiva |
| **Auth** | Supabase Auth | Google OAuth, Magic Link, sem custo até 50k MAU |
| **Banco de Dados** | Supabase PostgreSQL | RLS, realtime, integrado ao auth |
| **Storage** | Cloudflare R2 | PDFs gerados, sem egress fee, mais barato em escala |
| **Pagamentos** | Mercado Pago (Checkout Pro) | Líder no Brasil, PIX + cartão |
| **Conversão** | jsPDF + browser-image-compression | Client-side, sem custo de servidor |
| **PWA** | next-pwa, Service Worker | Installable, offline-first |
| **Deploy** | Vercel | CI/CD automático, edge functions |
| **Ícones** | Lucide React | Leve, consistente |

---

## 5. Modelo de Monetização

### Plano Free
- **5 conversões/mês**
- Foto única → PDF
- Download direto
- Sem histórico

### Plano Pro — R$ 9,90/mês
- **Conversões ilimitadas**
- Múltiplas fotos → 1 PDF
- Histórico de conversões
- Links de compartilhamento
- Upload para nuvem (R2)
- Suporte prioritário

### Regras
- Contador reseta todo dia 1 do mês
- Conversões não utilizadas **não acumulam**
- Upgrade/downgrade a qualquer momento
- Cancelamento imediato (sem fidelidade)
- Pagamento via PIX ou cartão (Mercado Pago)

---

## 6. Estrutura de Pastas (Planejada)

```
pdffull/
├── public/
│   ├── manifest.json
│   ├── icons/
│   └── sw.js
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── converter/        # Tela principal de conversão
│   │   │   ├── historico/        # Histórico de PDFs
│   │   │   └── conta/            # Perfil e plano
│   │   ├── api/
│   │   │   ├── checkout/         # Mercado Pago
│   │   │   ├── webhooks/
│   │   │   │   └── mercadopago/
│   │   │   └── upload/           # Upload R2
│   │   ├── layout.tsx
│   │   └── page.tsx              # Landing page
│   ├── components/
│   │   ├── ui/                   # shadcn/ui
│   │   ├── camera-capture.tsx
│   │   ├── pdf-preview.tsx
│   │   └── conversion-progress.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── r2/
│   │   │   └── upload.ts
│   │   ├── pdf/
│   │   │   ├── generate.ts       # jsPDF wrapper
│   │   │   └── compress.ts       # browser-image-compression
│   │   └── mercadopago/
│   │       └── checkout.ts
│   ├── hooks/
│   │   ├── use-camera.ts
│   │   ├── use-pdf-generator.ts
│   │   └── use-conversion-limit.ts
│   └── types/
│       └── index.ts
├── supabase/
│   ├── config.toml
│   └── migrations/
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 7. Banco de Dados (Supabase)

### Tabela `profiles`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid (PK, FK auth.users) | ID do usuário |
| email | text | Email |
| name | text | Nome |
| plan | text | `free` ou `pro` |
| conversions_this_month | int | Contador mensal |
| conversions_reset_at | timestamptz | Data do próximo reset |
| mp_customer_id | text | ID do cliente no Mercado Pago |
| created_at | timestamptz | Criação |
| updated_at | timestamptz | Atualização |

### Tabela `conversions`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid (PK) | ID da conversão |
| user_id | uuid (FK profiles) | Usuário |
| filename | text | Nome do arquivo original |
| pdf_url | text | URL do PDF no R2 |
| pages | int | Número de páginas |
| size_bytes | bigint | Tamanho do PDF |
| shared | boolean | Se gerou link público |
| created_at | timestamptz | Data da conversão |

### Tabela `subscriptions`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid (PK) | ID da assinatura |
| user_id | uuid (FK profiles) | Usuário |
| mp_subscription_id | text | ID da assinatura no MP |
| plan | text | `pro` |
| status | text | `active`, `cancelled`, `pending` |
| current_period_start | timestamptz | Início do período |
| current_period_end | timestamptz | Fim do período |
| created_at | timestamptz | Criação |

### RLS (Row Level Security)
- `profiles`: usuário só acessa seu próprio perfil
- `conversions`: usuário só vê suas próprias conversões
- `subscriptions`: usuário só vê suas próprias assinaturas
- Service Role Key usado apenas no backend (webhooks)
