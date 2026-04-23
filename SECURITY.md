# Política de Segurança — PDFfull

> Última revisão: 2026-04-20

A privacidade e a segurança dos arquivos enviados pelos usuários são prioridade absoluta deste projeto.
Agradecemos a divulgação responsável de vulnerabilidades.

## 📬 Reportando uma vulnerabilidade

**Não abra issue pública para vulnerabilidades de segurança.**

Envie um e-mail para: **security@pdf-full.com**

Inclua:

- Descrição clara da vulnerabilidade
- Passos para reproduzir (PoC)
- Versão / commit afetado
- Impacto estimado (confidencialidade / integridade / disponibilidade)
- Sua sugestão de correção, se houver

Você receberá:

- **Confirmação** em até **48h úteis**
- **Avaliação inicial** em até **5 dias úteis**
- **Plano de correção** em até **10 dias úteis** para vulnerabilidades altas/críticas
- **Crédito público** em `SECURITY.md` (a menos que prefira anonimato)

## 🎯 Escopo

**Em escopo:**

- Aplicação principal: `https://pdf-full.com`
- API: `/api/*`
- Pipelines de conversão de PDF (server-side)
- Storage de uploads (Supabase Storage)

**Fora de escopo:**

- DoS volumétrico
- Spam / engenharia social contra usuários
- Vulnerabilidades em dependências já reportadas publicamente
- Bugs visuais sem impacto de segurança

## 🚫 Regras de teste

- **Não** acesse arquivos / contas de outros usuários
- **Não** rode scans automatizados contra produção sem aviso prévio
- **Não** exfiltre dados — pare assim que confirmar o impacto
- Crie sua própria conta para teste; não use contas alheias
- Não suba arquivos maliciosos / com payload destrutivo (JS embutido em PDF, zip-bombs etc.) sem aviso prévio

Cumprindo essas regras, **não tomaremos ações legais** contra divulgação responsável (Safe Harbor).

## 🛡️ Versões suportadas

| Versão | Suporte de segurança |
|---|---|
| `master` (produção) | ✅ |
| Tags `v0.x` | ❌ (pré-release) |

## 🔐 Práticas de segurança em uso

- **Headers HTTP** completos: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (configurados em `next.config.ts`)
- **RLS** habilitada em todas as tabelas Supabase (4/4)
- **Service Role Key** nunca exposta ao client
- **Hash SHA-256** para checksums de arquivos (sem MD5)
- **Auditoria de uploads** via `validate-upload.mjs` do GENESIS
- **Storage RLS** com policy específica de upload (migration `005`)
- **Termos aceitos** registrados antes de uso (migration `003`)
- Quando processamento Gemini é usado, prompts não recebem conteúdo do usuário sem sanitização

## 📜 Conformidade

- **LGPD** (Brasil): página `/privacidade` e `/termos` informam tratamento de dados
- **VDP** seguindo [RFC 9116](https://datatracker.ietf.org/doc/html/rfc9116) (security.txt em breve)
- Auditoria GÊNESIS completa: ver `relatorios/auditoria-pdffull-2026-04-20.md` no PROJETO-GENESIS

## 🏆 Hall of Fame

_(Aguardando primeiros reports.)_

## 📋 Achados aceitos (triagem)

Findings de ferramentas SAST que foram analisados e **classificados como aceitos** (falso-positivo ou by-design), com justificativa:

### Android — `activity android:exported="true"`

- **Arquivos:** `twa/app/src/main/AndroidManifest.xml`
  - `LauncherActivity` (gerada por Bubblewrap/TWA)
  - `PdfHandlerActivity` (file handler para "Abrir PDF com PDFfULL")
- **Regra:** Semgrep `java.android.security.android-manifest-exported-activity` (CWE-926)
- **Severidade reportada:** HIGH
- **Status:** **Aceito (by-design).**
- **Justificativa:** Ambas as activities **precisam** ser `exported="true"`:
  - `LauncherActivity` é o entry-point do TWA (sem ela, o app não abre pela gaveta de apps nem recebe intents `ACTION_VIEW` do navegador).
  - `PdfHandlerActivity` registra o app como handler do MIME `application/pdf` via `intent-filter`, funcionalidade essencial do produto.
  - Nenhuma activity exposta acessa dados privilegiados: ambas apenas delegam para a WebView Custom Tab do PWA, que executa sob o mesmo modelo de segurança do navegador (origem controlada via Digital Asset Links).

- **Revisão:** 2026-04-23

---

Obrigado por ajudar a manter o PDFfull seguro. 🛡️
