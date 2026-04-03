# 📖 FAQ — PDFfULL

> Guia completo de uso, funcionalidades e políticas do PDFfULL.  
> **URL:** https://www.pdf-full.com/faq

---

## 📱 Uso Geral

### O que é o PDFfULL?

O PDFfULL é um aplicativo web progressivo (PWA) que converte fotos em PDFs otimizados de forma instantânea. Funciona em qualquer celular ou computador com navegador moderno — sem precisar instalar aplicativos pesados.

**Principais características:**
- Conversão foto → PDF em segundos
- Processamento 100% local (no dispositivo)
- Funciona offline após instalação
- Interface minimalista e intuitiva

### Como usar (passo a passo)

1. **Acesse** https://www.pdf-full.com
2. **Faça login** com Google ou email (link mágico)
3. **Aceite os Termos** de Uso na primeira vez
4. Vá para **Converter**
5. **Tire uma foto** pela câmera ou selecione da **galeria**
6. Adicione **mais fotos** se desejar (cada uma = 1 página do PDF)
7. **Reordene** as fotos arrastando (se necessário)
8. Clique em **"Gerar PDF"**
9. Aguarde: compressão → geração → upload (barra de progresso)
10. **Pronto!** Seu PDF está disponível para:
    - 📥 Baixar
    - 📤 Compartilhar (WhatsApp, Email, SMS)
    - 🤖 Analisar com IA
    - 🔄 Nova conversão

### Como instalar no celular

**Android (Chrome):**
1. Acesse www.pdf-full.com
2. Toque no menu (⋮) no canto superior direito
3. Selecione "Adicionar à tela inicial"
4. Confirme — o ícone do PDFfULL aparecerá como um app

**iOS (Safari):**
1. Acesse www.pdf-full.com
2. Toque no botão compartilhar (↗)
3. Selecione "Adicionar à Tela de Início"
4. Confirme — o ícone aparecerá como um app nativo

---

## 💰 Planos e Preços

### Plano Free (Grátis)

| Recurso | Disponível |
|---------|:----------:|
| Conversões/mês | 5 |
| Download PDF | ✅ |
| Compartilhamento | ✅ |
| Histórico | ✅ |
| Análise com IA | ✅ |
| Armazenamento na nuvem | ✅ |

### Plano Pro (R$ 9,90/mês)

| Recurso | Disponível |
|---------|:----------:|
| Conversões/mês | **Ilimitadas** |
| Download PDF | ✅ |
| Compartilhamento | ✅ |
| Histórico | ✅ |
| Análise com IA | ✅ |
| Armazenamento na nuvem | ✅ |
| Prioridade no suporte | ✅ |

### Como assinar o Pro

1. Acesse **Conta** (menu superior)
2. Clique em **"Upgrade para Pro"**
3. Você será redirecionado ao **Mercado Pago**
4. Escolha: cartão de crédito, PIX ou boleto
5. Após confirmação, seu plano muda instantaneamente

### Cancelamento

- Acesse **Conta** > **Cancelar assinatura**
- O acesso Pro continua até o fim do período pago
- Depois, volta automaticamente para o plano Free
- Seus PDFs e histórico são mantidos

### Reset mensal

O contador de conversões do plano Free é zerado automaticamente no **dia 1 de cada mês**.

---

## 🤖 Análise com IA

O PDFfULL integra o **Google Gemini 2.0 Flash** para análise inteligente dos seus PDFs.

### O que a IA analisa?

1. **Resumo** — O que é o documento e sua finalidade
2. **Conteúdo Principal** — Pontos mais importantes
3. **Detalhes Técnicos** — Tipo de documento, idioma, características
4. **Observações** — Informações relevantes, problemas de legibilidade

### Como usar

1. Após converter um PDF, clique em **"Análise com IA"**
2. Aguarde a análise automática (alguns segundos)
3. Leia o resultado organizado em seções
4. **Faça perguntas** no chat para aprofundar a análise

### A IA funciona em PDFs do histórico?

Sim! Na página **Histórico**, clique no ícone ✨ ao lado de qualquer PDF para iniciar a análise com IA.

---

## 📤 Compartilhamento

### Opções de compartilhamento

| Canal | Como funciona |
|-------|--------------|
| **WhatsApp** | Abre o WhatsApp Web/App com o texto e link do PDF |
| **Email** | Abre seu cliente de email com assunto e corpo preenchidos |
| **SMS** | Abre o app de mensagens com o texto pronto |
| **Copiar link** | Copia o link público do PDF para a área de transferência |
| **Nativo (mobile)** | Usa o sistema de compartilhamento do celular (inclui o arquivo PDF) |

### Compartilhamento em lote

Na página **Histórico**, selecione vários PDFs e use o botão **"WhatsApp"** para enviar todos os links de uma vez.

---

## 📂 Histórico

- Todos os PDFs gerados ficam salvos automaticamente
- Lista com data, nome, tamanho e número de páginas
- Ações individuais: baixar, compartilhar, IA, excluir
- **Seleção múltipla**: marque vários PDFs para ações em lote
- **"Selecionar todos"**: marca todos os PDFs de uma vez

---

## 🔐 Privacidade e Segurança

### Processamento local

Suas fotos são processadas **inteiramente no seu dispositivo**. A compressão e geração do PDF acontecem no navegador. Nenhuma imagem é enviada para nossos servidores durante a conversão.

### Armazenamento seguro

O PDF gerado é enviado para armazenamento seguro na nuvem (Supabase Storage). O acesso é protegido por **Row Level Security (RLS)** — cada usuário só acessa seus próprios documentos.

### Segurança técnica

- **HTTPS** obrigatório (HSTS ativo)
- **Headers de segurança**: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Validação de uploads**: MIME type + magic bytes + tamanho máximo
- **Sanitização de nomes**: previne path traversal
- **Webhooks validados**: HMAC SHA256

### LGPD

O PDFfULL cumpre integralmente a **Lei Geral de Proteção de Dados** (Lei 13.709/2018):

- **Base legal**: Consentimento e execução de contrato
- **Dados coletados**: Email, nome (do Google) e PDFs gerados
- **Finalidade**: Apenas para operação do serviço
- **Compartilhamento**: Não vendemos ou compartilhamos dados com terceiros
- **Exclusão**: Você pode excluir seus PDFs a qualquer momento
- **DPO**: Contato disponível na Política de Privacidade

> 📄 Política de Privacidade completa: https://www.pdf-full.com/privacidade  
> 📄 Termos de Uso: https://www.pdf-full.com/termos

---

## ❓ Problemas Comuns

### A câmera não abre

- Verifique permissões do navegador (Configurações > Permissões > Câmera)
- No iOS, use o Safari (não o Chrome, que tem restrições de câmera)
- Alternativa: use "Selecionar da galeria"

### "Limite mensal atingido"

- Plano Free = 5 conversões/mês
- Opções: fazer upgrade Pro (R$ 9,90) ou aguardar o dia 1 do próximo mês

### "Não autorizado"

- Sua sessão pode ter expirado — faça login novamente
- Se estiver no plano Free e atingiu 5 conversões, faça upgrade

### PDF com qualidade ruim

- Tire fotos com boa iluminação
- Evite tremores (apoie o celular)
- Resolução mínima recomendada: 1920px
- As imagens são comprimidas para otimizar tamanho

### Análise com IA mostra erro

- Certifique-se de que o PDF foi gerado com sucesso
- Se for um PDF do histórico, ele precisa estar salvo na nuvem
- Tente gerar um novo PDF e analisar novamente

---

## 🛠 Stack Técnica

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Estilização | Tailwind CSS v4 + shadcn/ui v4 |
| Backend | API Routes (Next.js) |
| Banco de dados | Supabase (PostgreSQL + RLS) |
| Armazenamento | Supabase Storage / Cloudflare R2 |
| Pagamentos | Mercado Pago (Checkout Pro) |
| IA | Google Gemini 2.0 Flash |
| Deploy | Vercel (auto-deploy) |
| PWA | Service Worker + manifest.json |

---

## 📞 Contato

- **Site:** https://www.pdf-full.com
- **Sobre:** https://www.pdf-full.com/sobre
- **Privacidade:** https://www.pdf-full.com/privacidade
- **Termos:** https://www.pdf-full.com/termos
- **FAQ:** https://www.pdf-full.com/faq

---

*Última atualização: Abril de 2026*
