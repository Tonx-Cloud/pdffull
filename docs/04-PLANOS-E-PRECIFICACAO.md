# PDFfULL — Planos e Precificação

> **Atualizado:** 05/04/2026

---

## Modelo Freemium

| Recurso | Free | Pro (R$ 9,90/mês) |
|---------|------|-------------------|
| Conversões/mês | 5 | Ilimitadas |
| Captura com câmera | ✅ | ✅ |
| Upload da galeria | ✅ | ✅ |
| Múltiplas fotos → 1 PDF | ✅ | ✅ |
| Download do PDF | ✅ | ✅ |
| Compartilhar via link | ✅ | ✅ |
| Merge de PDFs | ✅ | ✅ |
| Análise com IA (Gemini) | ✅ | ✅ |
| Renomear PDFs | ✅ | ✅ |
| Histórico na nuvem | ❌ | ✅ |
| PDFs salvos no R2 | ❌ | ✅ |
| Suporte prioritário | ❌ | ✅ |

---

## Pagamento

| Item | Detalhe |
|------|---------|
| Gateway | Mercado Pago (Checkout Pro) |
| Preço | R$ 9,90/mês |
| Meios de pagamento | PIX, cartão de crédito, boleto |
| Webhook | `/api/webhooks/mercadopago` (HMAC verificado) |
| Cancelamento | Self-service via `/conta` |

---

## Estratégia

1. **Free sem login**: Permitir 5 conversões/mês sem necessidade de cadastro (atrai usando localStorage como contador local).
2. **Login para salvar**: Histórico, nuvem e upgrade requerem conta Google OAuth.
3. **Upgrade natural**: Quando atinge o limite mensal, modal de upgrade aparece com destaque nos benefícios Pro.
