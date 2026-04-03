# 📄 PDFfULL — Conversor Instantâneo de PDF

> Tire uma foto e converta em PDF otimizado em um clique. Grátis, rápido e direto do celular.

**Produção:** [www.pdf-full.com](https://www.pdf-full.com)

---

## Funcionalidades

- **Foto → PDF em 1 clique** — Capture com a câmera ou selecione da galeria
- **Processamento local** — Compressão e geração de PDF acontecem no navegador, sem enviar suas fotos para nenhum servidor
- **Múltiplas páginas** — Adicione várias fotos, reordene e gere um PDF multi-página
- **Compartilhar** — WhatsApp, Email, SMS ou Web Share API (mobile com arquivo anexado)
- **Análise com IA** — Gemini analisa o conteúdo do PDF com chat de follow-up
- **Histórico** — Conversões salvas na nuvem com seleção em lote, download e exclusão
- **PWA** — Instalável como app nativo no celular
- **SaaS** — Plano Free (5/mês) e Pro (R$ 9,90/mês, ilimitado) via Mercado Pago

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui v4 |
| Backend | Next.js API Routes (App Router) |
| Auth | Supabase Auth (Google OAuth + Magic Link) |
| Banco | Supabase (PostgreSQL + RLS) |
| Storage | Cloudflare R2 (S3-compatible) |
| Pagamentos | Mercado Pago (Checkout Pro) |
| IA | Google Gemini 2.5 Flash |
| Emails | Resend |
| Deploy | Vercel |
| Testes | Playwright (48 E2E specs) |

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/          # Login, Register
│   ├── (dashboard)/     # Converter, Histórico, Conta
│   ├── api/             # Upload, Checkout, Analyze, Webhooks, CRON
│   ├── auth/            # Callback OAuth
│   ├── sobre/           # Sobre nós
│   ├── termos/          # Termos de uso
│   ├── privacidade/     # Política de privacidade
│   └── page.tsx         # Landing page
├── components/          # UI components (share-menu, ai-modal, etc.)
├── hooks/               # use-conversion-limit
├── lib/
│   ├── supabase/        # Client + Server
│   ├── pdf/             # Compress + Generate (client-side)
│   ├── r2/              # Upload para Cloudflare R2
│   └── email/           # Resend (boas-vindas, upgrade)
└── types/               # TypeScript types
docs/                    # Documentação (kanban, visão geral, guias)
supabase/                # Migrations SQL (001-004)
tests/                   # Playwright E2E
```

## Setup Local

```bash
# 1. Clonar
git clone https://github.com/Tonx-Cloud/pdffull.git
cd pdffull

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher com suas chaves (Supabase, R2, Mercado Pago, Gemini, Resend)

# 4. Rodar migrations no Supabase
# Execute 001_initial_schema.sql até 004_delete_policy.sql no SQL Editor do Supabase

# 5. Desenvolvimento
npm run dev
```

## Variáveis de Ambiente

Veja `.env.example` para a lista completa. As principais:

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (admin) |
| `GEMINI_API_KEY` | Chave da API Google Gemini |
| `RESEND_API_KEY` | Chave da API Resend |
| `R2_*` | Credenciais Cloudflare R2 |
| `MP_ACCESS_TOKEN` | Token Mercado Pago |

## Segurança

- Validação MIME type + magic bytes no upload
- Sanitização de filenames (path traversal prevention)
- 6 security headers (HSTS, X-Frame-Options DENY, CSP, etc.)
- Webhook HMAC SHA256 validation (Mercado Pago)
- Auditoria de webhooks (tabela `webhook_logs`)
- RLS em todas as tabelas
- Aceite obrigatório de Termos de Uso (checkbox + modal)

## Deploy

Push para `master` → deploy automático na Vercel.

```bash
git push origin master
```

## Documentação

- [Kanban Geral](docs/KANBAN-GERAL.md) — Roadmap completo com todas as fases
- [Visão Geral](docs/01-VISAO-GERAL-DO-PROJETO.md) — Arquitetura e decisões técnicas

## Licença

Projeto proprietário — © 2026 PDFfULL. Todos os direitos reservados.
