import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — PDFfULL",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 prose prose-sm">
      <h1>Política de Privacidade</h1>
      <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <h2>1. Dados Coletados</h2>
      <p>Coletamos apenas os dados necessários para o funcionamento do serviço:</p>
      <ul>
        <li><strong>Conta:</strong> email, nome (via Google ou cadastro)</li>
        <li><strong>Uso:</strong> quantidade de conversões, datas de acesso</li>
        <li><strong>Pagamento:</strong> dados processados exclusivamente pelo Mercado Pago</li>
      </ul>

      <h2>2. Processamento Local</h2>
      <p>
        A conversão de fotos em PDF é feita <strong>inteiramente no seu dispositivo</strong>.
        Suas imagens não são enviadas para nossos servidores durante o processo de conversão.
        Os PDFs só são enviados à nuvem se você estiver logado, para manter seu histórico.
      </p>

      <h2>3. Armazenamento</h2>
      <p>
        Para usuários autenticados, os PDFs gerados são armazenados no Cloudflare R2
        (criptografia em repouso). Os dados de conta são armazenados no Supabase (PostgreSQL).
      </p>

      <h2>4. Compartilhamento de Dados</h2>
      <p>Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto:</p>
      <ul>
        <li>Mercado Pago — exclusivamente para processamento de pagamentos</li>
        <li>Obrigações legais — quando exigido por lei</li>
      </ul>

      <h2>5. Cookies</h2>
      <p>
        Utilizamos cookies estritamente necessários para autenticação e sessão.
        Não utilizamos cookies de rastreamento ou publicidade.
      </p>

      <h2>6. Seus Direitos (LGPD)</h2>
      <p>Conforme a Lei Geral de Proteção de Dados (LGPD), você pode:</p>
      <ul>
        <li>Solicitar acesso aos seus dados pessoais</li>
        <li>Solicitar correção de dados incorretos</li>
        <li>Solicitar exclusão dos seus dados e conta</li>
        <li>Revogar consentimento a qualquer momento</li>
      </ul>

      <h2>7. Segurança</h2>
      <p>
        Utilizamos criptografia TLS em trânsito, criptografia em repouso para PDFs
        armazenados, e Row Level Security (RLS) para garantir que cada usuário
        acesse apenas seus próprios dados.
      </p>

      <h2>8. Alterações</h2>
      <p>
        Esta política pode ser atualizada periodicamente. Notificaremos sobre
        mudanças significativas pela interface do aplicativo.
      </p>

      <hr />
      <p className="text-sm">
        <Link href="/termos" className="text-blue-600 hover:underline">
          Termos de Uso
        </Link>
        {" • "}
        <Link href="/" className="text-blue-600 hover:underline">
          Voltar ao início
        </Link>
      </p>
    </div>
  );
}
