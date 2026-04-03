import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso — PDFfULL",
};

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 prose prose-sm">
      <h1>Termos de Uso</h1>
      <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <h2>1. Aceitação dos Termos</h2>
      <p>
        Ao acessar e utilizar o PDFfULL (&quot;Serviço&quot;), você concorda com estes Termos de Uso.
        Se não concordar, não utilize o Serviço.
      </p>

      <h2>2. Descrição do Serviço</h2>
      <p>
        O PDFfULL é um aplicativo web (PWA) que permite converter fotos em documentos PDF.
        O processamento é feito localmente no seu dispositivo. Os PDFs gerados podem ser
        armazenados na nuvem para usuários autenticados.
      </p>

      <h2>3. Planos e Pagamentos</h2>
      <p>
        O Serviço oferece um plano gratuito (5 conversões/mês) e um plano Pro (R$ 9,90/mês,
        conversões ilimitadas). Pagamentos são processados via Mercado Pago.
        Cancelamentos podem ser feitos a qualquer momento pela página de conta.
      </p>

      <h2>4. Uso Aceitável</h2>
      <p>Você concorda em não utilizar o Serviço para:</p>
      <ul>
        <li>Atividades ilegais ou fraudulentas</li>
        <li>Upload de conteúdo ilegal, ofensivo ou que viole direitos de terceiros</li>
        <li>Tentativas de sobrecarregar, hackear ou comprometer nossos sistemas</li>
        <li>Uso automatizado (bots, scripts) sem autorização</li>
      </ul>

      <h2>5. Propriedade Intelectual</h2>
      <p>
        O conteúdo que você converte (fotos e PDFs) permanece de sua propriedade.
        O PDFfULL retém direitos sobre o aplicativo, marca e código-fonte.
      </p>

      <h2>6. Limitação de Responsabilidade</h2>
      <p>
        O Serviço é fornecido &quot;como está&quot;. Não nos responsabilizamos por perda
        de dados, interrupções do serviço ou danos decorrentes do uso do aplicativo.
      </p>

      <h2>7. Alterações</h2>
      <p>
        Podemos atualizar estes Termos a qualquer momento. A continuidade de uso
        após alterações constitui aceitação dos novos termos.
      </p>

      <h2>8. Contato</h2>
      <p>
        Dúvidas sobre estes Termos? Entre em contato pelo email informado na página do aplicativo.
      </p>

      <hr />
      <p className="text-sm">
        <Link href="/privacidade" className="text-blue-600 hover:underline">
          Política de Privacidade
        </Link>
        {" • "}
        <Link href="/" className="text-blue-600 hover:underline">
          Voltar ao início
        </Link>
      </p>
    </div>
  );
}
