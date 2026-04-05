# PDFfULL — Schema do Banco de Dados

> **Atualizado:** 05/04/2026  
> **Banco:** Supabase (PostgreSQL v17)  
> **Projeto:** `ndckyfnasriciclctpvf`

---

## 1. Tabelas

### profiles
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid (PK, FK auth.users) | ID do usuário |
| email | text | Email do usuário |
| name | text | Nome (nullable) |
| plan | text | `free` ou `pro` |
| conversions_this_month | integer | Contador mensal |
| conversions_reset_at | timestamptz | Próximo reset |
| mp_customer_id | text | ID Mercado Pago (nullable) |
| terms_accepted_at | timestamptz | Data aceite dos termos |
| created_at | timestamptz | Criação |
| updated_at | timestamptz | Última atualização |

### conversions
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid (PK) | ID da conversão |
| user_id | uuid (FK profiles) | Dono |
| filename | text | Nome do arquivo |
| pdf_url | text | URL do PDF no R2 |
| pages | integer | Nº de páginas |
| size_bytes | bigint | Tamanho em bytes |
| shared | boolean | Se foi compartilhado |
| created_at | timestamptz | Criação |

### subscriptions
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid (PK) | ID da assinatura |
| user_id | uuid (FK profiles, UNIQUE) | Dono |
| mp_subscription_id | text | ID no Mercado Pago |
| plan | text | `pro` |
| status | text | `active`, `cancelled`, `pending` |
| current_period_start | timestamptz | Início do período |
| current_period_end | timestamptz | Fim do período |
| created_at | timestamptz | Criação |

### webhook_logs
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid (PK) | ID do log |
| event_type | text | Tipo do evento |
| payment_id | text | ID pagamento (nullable) |
| status | text | `processed`, `rejected`, `ignored`, `error` |
| ip | text | IP de origem |
| verified | boolean | HMAC passou |
| details | text | Detalhes extras |
| created_at | timestamptz | Timestamp |

---

## 2. RLS (Row Level Security)

Todas as tabelas têm RLS ativado:

- **profiles**: `SELECT/UPDATE` onde `auth.uid() = id`
- **conversions**: `SELECT/INSERT/DELETE` onde `auth.uid() = user_id`
- **subscriptions**: `SELECT` onde `auth.uid() = user_id`
- **webhook_logs**: Sem acesso público (apenas service_role)

---

## 3. Storage (Supabase)

| Bucket | Uso | Política |
|--------|-----|----------|
| `pdfs` | Upload temporário de análise IA (`ai-tmp/`) | Autenticados podem upload, público para leitura |

---

## 4. Migrações

| Arquivo | Conteúdo |
|---------|----------|
| `001_initial_schema.sql` | Tabelas profiles, conversions, subscriptions |
| `002_webhook_logs.sql` | Tabela webhook_logs |
| `003_terms_accepted.sql` | Campo terms_accepted_at |
| `004_delete_policy.sql` | Políticas RLS de delete |
| `005_storage_upload_policy.sql` | Políticas de upload no storage |
