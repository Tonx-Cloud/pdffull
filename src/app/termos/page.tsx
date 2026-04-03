import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso — PDFfULL",
  description: "Termos e condições de uso do PDFfULL.",
};

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 prose prose-sm">
      <h1>Termos de Uso</h1>
      <p className="text-muted-foreground">Última atualização: 03 de abril de 2026</p>

      <p>
        Estes Termos de Uso (&quot;Termos&quot;) regulam o acesso e uso do <strong>PDFfULL</strong> (&quot;Serviço&quot;),
        disponível em <a href="https://pdffull.vercel.app">pdffull.vercel.app</a>.
        Ao criar uma conta ou utilizar o Serviço, você declara que leu, compreendeu e concorda
        com estes Termos e com nossa{" "}
        <Link href="/privacidade" className="text-blue-600">Política de Privacidade</Link>.
      </p>

      <h2>1. Aceitação dos Termos</h2>
      <p>
        Ao acessar, registrar-se ou utilizar qualquer funcionalidade do PDFfULL, você aceita
        integralmente estes Termos. Se não concordar com alguma disposição, não utilize o Serviço.
        A aceitação é registrada eletronicamente no momento do cadastro.
      </p>

      <h2>2. Descrição do Serviço</h2>
      <p>
        O PDFfULL é um aplicativo web progressivo (PWA) que permite converter fotografias
        em documentos PDF. O processamento é realizado <strong>localmente no dispositivo do
        usuário</strong>, garantindo privacidade. Funcionalidades adicionais (histórico,
        armazenamento em nuvem) estão disponíveis para usuários autenticados.
      </p>

      <h2>3. Cadastro e Conta</h2>
      <ul>
        <li>Você deve fornecer informações verdadeiras e atualizadas ao criar sua conta.</li>
        <li>Você é responsável pela segurança das suas credenciais de acesso.</li>
        <li>Cada pessoa deve manter apenas uma conta ativa.</li>
        <li>Reservamo-nos o direito de suspender contas que violem estes Termos.</li>
      </ul>

      <h2>4. Planos e Pagamentos</h2>
      <ul>
        <li><strong>Plano Gratuito:</strong> 5 conversões por mês, com histórico limitado.</li>
        <li><strong>Plano Pro (R$ 9,90/mês):</strong> conversões ilimitadas, histórico completo na nuvem.</li>
      </ul>
      <p>
        Pagamentos são processados pelo <strong>Mercado Pago</strong>. Ao contratar o plano Pro,
        você concorda com os termos de pagamento do Mercado Pago. O cancelamento pode ser
        feito a qualquer momento pela página de conta, com efeito ao fim do período já pago.
        <strong> Não realizamos reembolsos</strong> de períodos parcialmente utilizados.
      </p>

      <h2>5. Uso Aceitável</h2>
      <p>Você concorda em <strong>não</strong> utilizar o Serviço para:</p>
      <ul>
        <li>Atividades ilegais, fraudulentas ou que violem a legislação brasileira</li>
        <li>Upload ou conversão de conteúdo ilegal, difamatório, ou que viole direitos de terceiros</li>
        <li>Tentativas de sobrecarregar, explorar vulnerabilidades ou comprometer nossos sistemas</li>
        <li>Uso automatizado (bots, scripts, crawlers) sem autorização prévia por escrito</li>
        <li>Contornar limites de uso, criar múltiplas contas ou fraudar o sistema de planos</li>
        <li>Distribuir malware, vírus ou qualquer código malicioso</li>
      </ul>

      <h2>6. Propriedade Intelectual</h2>
      <p>
        O conteúdo que você converte (fotos e PDFs) <strong>permanece de sua propriedade</strong>.
        O PDFfULL retém todos os direitos sobre o aplicativo, marca, interface, código-fonte
        e documentação. Você recebe uma licença limitada, não exclusiva e revogável para
        uso pessoal do Serviço.
      </p>

      <h2>7. Limitação de Responsabilidade</h2>
      <p>
        O Serviço é fornecido &quot;como está&quot; e &quot;conforme disponível&quot;.
        Na máxima extensão permitida por lei, <strong>não nos responsabilizamos por:</strong>
      </p>
      <ul>
        <li>Perda de dados decorrente de falhas técnicas ou do dispositivo do usuário</li>
        <li>Interrupções temporárias do serviço para manutenção ou atualizações</li>
        <li>Danos indiretos, incidentais ou consequenciais decorrentes do uso</li>
        <li>Ações de terceiros (provedores de pagamento, infraestrutura)</li>
      </ul>
      <p>
        Nossa responsabilidade total é limitada ao valor pago pelo usuário nos últimos
        12 meses pelo uso do Serviço.
      </p>

      <h2>8. Suspensão e Encerramento</h2>
      <p>
        Podemos suspender ou encerrar sua conta, sem aviso prévio, caso identifiquemos
        violação destes Termos, uso abusivo ou atividade fraudulenta. Você pode encerrar
        sua conta a qualquer momento pela página de configurações.
      </p>

      <h2>9. Alterações nos Termos</h2>
      <p>
        Podemos atualizar estes Termos a qualquer momento. Alterações significativas serão
        comunicadas por email ou pela interface do aplicativo. A continuidade de uso após
        a notificação constitui aceitação dos novos Termos.
      </p>

      <h2>10. Legislação Aplicável</h2>
      <p>
        Estes Termos são regidos pela legislação da República Federativa do Brasil.
        Fica eleito o Foro da Comarca de Ribeirão Preto/SP para dirimir quaisquer
        controvérsias.
      </p>

      <h2>11. Contato</h2>
      <p>
        Dúvidas sobre estes Termos? Entre em contato:
      </p>
      <ul>
        <li>Email: <a href="mailto:contato@pdffull.com.br">contato@pdffull.com.br</a></li>
      </ul>

      <hr />
      <p className="text-sm">
        <Link href="/privacidade" className="text-blue-600 hover:underline">
          Política de Privacidade
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
