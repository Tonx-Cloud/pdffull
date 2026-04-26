# PDFfULL — Arquitetura Técnica

> **Atualizado:** 05/04/2026

---

## 1. Stack Principal

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.2.2 |
| UI | React + TypeScript | 19 / 5 |
| Estilo | Tailwind CSS v4 + shadcn/ui v4 | — |
| Banco de dados | Supabase (PostgreSQL v17) | — |
| Storage | Cloudflare R2 (S3-compatible) | — |
| Auth | Supabase Auth (Google OAuth) | — |
| IA | Gemini 2.0 Flash (`@google/generative-ai`) | — |
| i18n | next-intl (6 idiomas) | 4.9 |
| State | Zustand | 5.x |
| Validação | Zod | 3.x |
| Pagamento | Mercado Pago (Checkout Pro) | 2.12 |
| Email | Resend | 6.10 |
| Deploy | Vercel + Cloudflare DNS | — |
| Testes | Playwright E2E | 1.59 |
| PWA | Service Worker + manifest.json | — |
| Android | TWA (Trusted Web Activity) | — |

---

## 2. Diagrama de Componentes

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  Next.js App Router (Server + Client Components) │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Landing  │ │Converter │ │  Histórico/Conta │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│       │              │              │             │
│       └──────────────┴──────────────┘             │
│                      │                            │
│              Zustand Store                        │
└──────────────────────┬────────────────────────────┘
                       │ HTTPS
┌──────────────────────┴────────────────────────────┐
│                  API ROUTES                        │
│  /api/upload  /api/analyze  /api/checkout         │
│  /api/webhooks/mercadopago  /api/cron/reset        │
│  ┌─────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Zod    │  │Rate Limit│  │ Prompt Sanitize  │  │
│  └─────────┘  └──────────┘  └──────────────────┘  │
└────────┬──────────┬──────────┬─────────────────────┘
         │          │          │
    ┌────┴───┐ ┌────┴────┐ ┌──┴──────┐
    │Supabase│ │Gemini AI│ │  R2 S3  │
    │  Auth  │ │  Flash  │ │ Storage │
    │  DB    │ │         │ │         │
    └────────┘ └─────────┘ └─────────┘
```

---

## 3. Decisões Técnicas

| Decisão | Justificativa |
|---------|---------------|
| Next.js App Router | Server Components, streaming, SEO nativo |
| Supabase vs Firebase | PostgreSQL real, RLS, pricing previsível |
| R2 vs S3 | Egress gratuito, compatible com S3 SDK |
| Gemini vs OpenAI | Custo inferior, multimodal nativo (PDF/imagens) |
| Zustand vs Context | API simples, sem re-renders desnecessários |
| Zod vs Yup | First-class TypeScript, mais leve |
| Mercado Pago vs Stripe | Melhor para mercado brasileiro (PIX, boleto) |
| TWA vs Capacitor | Não precisa de código nativo para Android |

---

## 4. Segurança

- CSP (Content Security Policy) configurada em `next.config.ts`
- 6 security headers (HSTS, X-Frame-Options, X-Content-Type-Options, etc.)
- Rate limiting por IP em API routes
- Sanitização de prompts contra injection
- Validação Zod em todas as API routes
- RLS ativo em todas as tabelas Supabase
- HMAC verification nos webhooks do Mercado Pago
- Magic bytes validation em uploads de PDF
- Filename sanitization contra path traversal
