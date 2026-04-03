import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — PDFfULL",
  description: "Como o PDFfULL coleta, utiliza e protege seus dados pessoais.",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 prose prose-sm">
      <h1>Política de Privacidade</h1>
      <p className="text-muted-foreground">Última atualização: 03 de abril de 2026</p>

      <p>
        Esta Política de Privacidade descreve como o <strong>PDFfULL</strong> (&quot;nós&quot;, &quot;nosso&quot;)
        coleta, utiliza, armazena e protege os dados pessoais dos usuários (&quot;você&quot;) em
        conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)</strong>.
      </p>

      <h2>1. Dados Coletados</h2>
      <p>Coletamos apenas os dados estritamente necessários para o funcionamento do serviço:</p>
      <ul>
        <li><strong>Dados de conta:</strong> nome e email (via Google OAuth ou Magic Link)</li>
        <li><strong>Dados de uso:</strong> quantidade de conversões realizadas, datas de acesso, plano contratado</li>
        <li><strong>Dados de pagamento:</strong> processados exclusivamente pelo Mercado Pago — não armazenamos dados de cartão</li>
        <li><strong>Dados técnicos:</strong> endereço IP (registrado em logs de segurança), tipo de navegador</li>
      </ul>

      <h2>2. Processamento Local</h2>
      <p>
        A conversão de fotos em PDF é realizada <strong>inteiramente no seu dispositivo</strong> (client-side).
        Suas imagens <strong>não são enviadas para nossos servidores</strong> durante o processo de conversão.
        Os PDFs gerados só são enviados à nuvem se você estiver logado, para manter seu histórico.
      </p>

      <h2>3. Base Legal para o Tratamento</h2>
      <p>O tratamento dos seus dados é realizado com base em:</p>
      <ul>
        <li><strong>Consentimento (Art. 7º, I):</strong> ao criar conta e aceitar os Termos de Uso</li>
        <li><strong>Execução de contrato (Art. 7º, V):</strong> para prestação do serviço contratado</li>
        <li><strong>Legítimo interesse (Art. 7º, IX):</strong> para segurança e prevenção de fraudes</li>
      </ul>

      <h2>4. Armazenamento e Segurança</h2>
      <p>
        Seus dados são armazenados em infraestrutura segura com as seguintes proteções:
      </p>
      <ul>
        <li><strong>Criptografia TLS</strong> em todas as comunicações (dados em trânsito)</li>
        <li><strong>Criptografia em repouso</strong> para PDFs armazenados no Cloudflare R2</li>
        <li><strong>Row Level Security (RLS)</strong> no banco de dados — cada usuário acessa apenas seus próprios dados</li>
        <li><strong>Security headers</strong> (HSTS, CSP, X-Frame-Options) para proteção contra ataques web</li>
        <li><strong>Validação HMAC</strong> em webhooks de pagamento para prevenir transações fraudulentas</li>
      </ul>

      <h2>5. Compartilhamento de Dados</h2>
      <p>
        <strong>Não vendemos, alugamos ou compartilhamos</strong> seus dados pessoais com terceiros para
        fins comerciais. Seus dados podem ser compartilhados apenas com:
      </p>
      <ul>
        <li><strong>Mercado Pago:</strong> exclusivamente para processamento de pagamentos</li>
        <li><strong>Provedores de infraestrutura:</strong> Supabase (banco de dados), Cloudflare (armazenamento), Vercel (hospedagem) — todos com políticas de privacidade próprias e conformidade com regulamentações internacionais</li>
        <li><strong>Autoridades legais:</strong> quando exigido por ordem judicial ou determinação legal</li>
      </ul>

      <h2>6. Cookies</h2>
      <p>
        Utilizamos apenas cookies <strong>estritamente necessários</strong> para autenticação e sessão do usuário.
        Não utilizamos cookies de rastreamento, publicidade ou analytics de terceiros.
      </p>

      <h2>7. Retenção de Dados</h2>
      <ul>
        <li><strong>Dados de conta:</strong> mantidos enquanto sua conta estiver ativa</li>
        <li><strong>PDFs armazenados:</strong> mantidos até exclusão pelo usuário ou cancelamento da conta</li>
        <li><strong>Logs de segurança:</strong> mantidos por até 90 dias para fins de auditoria</li>
      </ul>

      <h2>8. Seus Direitos (LGPD — Art. 18)</h2>
      <p>Você tem direito a:</p>
      <ul>
        <li><strong>Confirmar</strong> a existência de tratamento dos seus dados</li>
        <li><strong>Acessar</strong> seus dados pessoais a qualquer momento</li>
        <li><strong>Corrigir</strong> dados incompletos, inexatos ou desatualizados</li>
        <li><strong>Solicitar anonimização,</strong> bloqueio ou eliminação de dados desnecessários</li>
        <li><strong>Solicitar portabilidade</strong> dos seus dados</li>
        <li><strong>Revogar consentimento</strong> a qualquer momento</li>
        <li><strong>Solicitar exclusão</strong> completa da sua conta e dados</li>
      </ul>
      <p>
        Para exercer qualquer destes direitos, entre em contato pelo email{" "}
        <a href="mailto:contato@pdffull.com.br">contato@pdffull.com.br</a>.
        Responderemos em até 15 dias úteis.
      </p>

      <h2>9. Menores de Idade</h2>
      <p>
        O PDFfULL não é direcionado a menores de 18 anos. Não coletamos intencionalmente
        dados de menores. Se tomarmos conhecimento de que dados de um menor foram coletados,
        providenciaremos a exclusão imediata.
      </p>

      <h2>10. Alterações nesta Política</h2>
      <p>
        Esta política pode ser atualizada periodicamente. Em caso de alterações significativas,
        notificaremos você pela interface do aplicativo ou por email. A data da última
        atualização será sempre indicada no topo desta página.
      </p>

      <h2>11. Contato e Encarregado de Dados</h2>
      <p>
        Para questões relacionadas à proteção de dados ou para exercer seus direitos:
      </p>
      <ul>
        <li>Email: <a href="mailto:contato@pdffull.com.br">contato@pdffull.com.br</a></li>
      </ul>

      <hr />
      <p className="text-sm">
        <Link href="/termos" className="text-blue-600 hover:underline">
          Termos de Uso
        </Link>
        {" • "}
        <Link href="/sobre" className="text-blue-600 hover:underline">
          Sobre Nós
        </Link>
        {" • "}
        <Link href="/" className="text-blue-600 hover:underline">
          Voltar ao início
        </Link>
      </p>
    </div>
  );
}
