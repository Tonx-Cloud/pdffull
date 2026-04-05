# 06 — Mercado Pago: Manual de Integração

> **Produto:** PDFfULL Pro — R$ 9,90/mês (assinatura recorrente)  
> **API:** Mercado Pago Subscriptions (PreApproval)  
> **SDK:** `mercadopago` npm (classes `PreApproval`, `Payment`)  
> **Ambiente:** Produção (`APP_USR-*`)  
> **Atualizado:** 05/04/2026

---

## 1. Visão Geral

O PDFfULL usa a **API de Assinaturas do Mercado Pago** (Subscriptions / PreApproval) para cobrar R$ 9,90/mês de forma recorrente e automática.

### Modelo escolhido: Assinatura sem plano associado, com pagamento pendente

- **Sem plano associado** → cada assinatura é independente
- **Status `pending`** → o usuário é redirecionado ao Mercado Pago para escolher o meio de pagamento (PIX, cartão, boleto)
- **Recorrência automática** → o MP cobra todo mês sem intervenção do vendedor

### Fluxo

```
Usuário clica "Assinar"
       ↓
POST /api/checkout → cria PreApproval (status: pending)
       ↓
Redireciona para init_point (ambiente Mercado Pago)
       ↓
Usuário paga (PIX / cartão / boleto)
       ↓
MP envia webhook → POST /api/webhooks/mercadopago
       ↓
Webhook valida HMAC, busca pagamento, ativa plano Pro
       ↓
Cobranças seguintes: automáticas pelo MP a cada mês
```

---

## 2. Credenciais e Variáveis de Ambiente

| Variável | Onde usar | Descrição |
|----------|-----------|-----------|
| `MP_ACCESS_TOKEN` | Server only | Token de acesso de produção (`APP_USR-*`) |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | Client only | Chave pública (não usada atualmente, reservada para Bricks) |
| `MP_WEBHOOK_SECRET` | Server only | Assinatura secreta para validação HMAC dos webhooks |

> ⚠️ **NUNCA** exponha `MP_ACCESS_TOKEN` no client-side.

### Onde estão configuradas

- **Local:** `.env.local`
- **Produção:** Vercel Environment Variables (Production scope)

---

## 3. API de Assinaturas (PreApproval)

### 3.1 Criar assinatura

```
POST https://api.mercadopago.com/preapproval
Authorization: Bearer MP_ACCESS_TOKEN
```

```json
{
  "reason": "PDFfULL Pro — Conversões Ilimitadas",
  "external_reference": "<user_id>",
  "payer_email": "<email>",
  "auto_recurring": {
    "frequency": 1,
    "frequency_type": "months",
    "transaction_amount": 9.90,
    "currency_id": "BRL"
  },
  "back_url": "https://www.pdf-full.com/conta?subscription=success",
  "notification_url": "https://www.pdf-full.com/api/webhooks/mercadopago?source_news=webhooks",
  "status": "pending"
}
```

**Resposta:** retorna `id` (preapproval_id) e `init_point` (URL de pagamento).

### 3.2 Consultar assinatura

```
GET https://api.mercadopago.com/preapproval/{id}
Authorization: Bearer MP_ACCESS_TOKEN
```

### 3.3 Cancelar assinatura

```
PUT https://api.mercadopago.com/preapproval/{id}
Authorization: Bearer MP_ACCESS_TOKEN

{ "status": "cancelled" }
```

### 3.4 Buscar assinaturas de um pagador

```
GET https://api.mercadopago.com/preapproval/search?payer_email=user@email.com
Authorization: Bearer MP_ACCESS_TOKEN
```

---

## 4. Webhooks

### 4.1 Configuração

Para assinaturas, a `notification_url` é passada na criação da assinatura (não via painel "Suas integrações"). Adicionamos `?source_news=webhooks` para receber apenas Webhooks (não IPN).

### 4.2 Tópicos relevantes

| Tópico | Evento | Quando |
|--------|--------|--------|
| `payment` | Pagamento criado/atualizado | Cada cobrança recorrente |
| `subscription_preapproval` | Assinatura criada/atualizada | Criação, cancelamento, pausa |
| `subscription_authorized_payment` | Pagamento autorizado | Cobrança autorizada |

### 4.3 Payload do webhook

```json
{
  "id": 12345,
  "live_mode": true,
  "type": "payment",
  "date_created": "2026-04-05T10:04:58.396-04:00",
  "user_id": 44444,
  "api_version": "v1",
  "action": "payment.created",
  "data": {
    "id": "999999999"
  }
}
```

### 4.4 Validação HMAC (x-signature)

O header `x-signature` contém `ts=<timestamp>,v1=<hash>`.

**Algoritmo:**

1. Extrair `ts` e `v1` do header
2. Montar manifest: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
3. Calcular HMAC-SHA256 do manifest com `MP_WEBHOOK_SECRET` como chave
4. Comparar com `v1`

**Implementação:** [`src/app/api/webhooks/mercadopago/route.ts`](../src/app/api/webhooks/mercadopago/route.ts)

### 4.5 Resposta esperada

Retornar **HTTP 200** ou **201** em até 22 segundos. Caso contrário, o MP reenvia a cada 15 min (3 tentativas, depois prorroga).

---

## 5. Cancelamento

### Fluxo

```
Usuário clica "Cancelar assinatura" em /conta
       ↓
POST /api/cancel-subscription
       ↓
Busca mp_subscription_id no Supabase
       ↓
PUT /preapproval/{id} → status: "cancelled" no MP
       ↓
Atualiza subscriptions.status = "cancelled" no Supabase
       ↓
Atualiza profiles.plan = "free"
```

---

## 6. Lógica de Cobranças Recorrentes (MP)

### Primeira parcela
Cobrada em até ~1 hora após a assinatura.

### Pagamento aprovado
Parcela processada (`processed`), sem nova tentativa.

### Pagamento recusado
Parcela entra em `recycling` → até 4 tentativas em janela de 10 dias.

### 3 parcelas recusadas consecutivas
Assinatura **cancelada automaticamente** pelo MP. O vendedor recebe e-mail.

### Atualização automática de cartões
O MP atualiza dados de cartões expirados via Card Updater.

---

## 7. Banco de Dados (Supabase)

### Tabela `subscriptions`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid (PK) | ID interno |
| `user_id` | uuid (FK→profiles) | Usuário |
| `mp_subscription_id` | text | PreApproval ID do Mercado Pago |
| `plan` | text | Sempre `'pro'` |
| `status` | text | `active`, `cancelled`, `pending` |
| `current_period_start` | timestamptz | Início do período |
| `current_period_end` | timestamptz | Fim do período |
| `created_at` | timestamptz | Criação |

### Tabela `webhook_logs`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `event_type` | text | Tipo do evento |
| `payment_id` | text | ID do pagamento |
| `status` | text | `processed`, `rejected`, `ignored`, `error` |
| `ip` | text | IP de origem |
| `verified` | boolean | HMAC válido? |
| `details` | text | Detalhes adicionais |

---

## 8. Cartões de Teste

| Tipo | Bandeira | Número | CVV | Validade |
|------|----------|--------|-----|----------|
| Crédito | Mastercard | `5031 4332 1540 6351` | `123` | `11/30` |
| Crédito | Visa | `4235 6477 2802 5682` | `123` | `11/30` |
| Crédito | Amex | `3753 651535 56885` | `1234` | `11/30` |
| Débito | Elo | `5067 7667 8388 8311` | `123` | `11/30` |

### Cenários de teste (nome do titular)

| Status | Nome | CPF |
|--------|------|-----|
| Aprovado | `APRO` | `12345678909` |
| Recusado (geral) | `OTHE` | `12345678909` |
| Pendente | `CONT` | — |
| Saldo insuficiente | `FUND` | — |
| CVV inválido | `SECU` | — |
| Data expirada | `EXPI` | — |
| Erro no formulário | `FORM` | — |
| Pagamento duplicado | `DUPL` | — |

---

## 9. Arquivos da Integração

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/lib/mercadopago/checkout.ts` | Cria assinatura (PreApproval) |
| `src/app/api/checkout/route.ts` | Endpoint POST/GET de checkout |
| `src/app/api/webhooks/mercadopago/route.ts` | Recebe e processa webhooks |
| `src/app/api/cancel-subscription/route.ts` | Cancelamento de assinatura |
| `src/components/modals/upgrade-modal.tsx` | Modal de upgrade (UI) |
| `src/components/account/conta-actions.tsx` | Botão upgrade/cancelar (UI) |

---

## 10. Referências

- [Documentação oficial: Assinaturas](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/landing)
- [API Reference: PreApproval](https://www.mercadopago.com.br/developers/pt/reference/subscriptions/_preapproval/post)
- [API Reference: PreApproval Plan](https://www.mercadopago.com.br/developers/pt/reference/subscriptions/_preapproval_plan/post)
- [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [Cartões de teste](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/test/cards)
- [SDK npm mercadopago](https://www.npmjs.com/package/mercadopago)
