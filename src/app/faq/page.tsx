import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ — PDFfULL",
  description:
    "Perguntas frequentes sobre o PDFfULL: como converter, planos, privacidade e mais.",
};

interface FaqItem {
  question: string;
  answer: string;
}

const faqSections: { title: string; items: FaqItem[] }[] = [
  {
    title: "Uso Geral",
    items: [
      {
        question: "O que é o PDFfULL?",
        answer:
          "O PDFfULL é um aplicativo web (PWA) que converte fotos em PDFs otimizados de forma instantânea. Funciona em qualquer celular ou computador com navegador moderno, sem precisar instalar nada.",
      },
      {
        question: "Como converter uma foto em PDF?",
        answer:
          "1. Faça login na sua conta\n2. Acesse a página Converter\n3. Tire uma foto ou selecione da galeria\n4. Adicione mais fotos se desejar (serão páginas do PDF)\n5. Reordene as imagens se necessário\n6. Clique em \"Gerar PDF\"\n7. Pronto! Baixe ou compartilhe seu PDF.",
      },
      {
        question: "Posso converter várias fotos em um único PDF?",
        answer:
          "Sim! Você pode adicionar quantas fotos quiser. Cada foto se torna uma página do PDF. É possível reordenar as fotos antes de gerar o documento.",
      },
      {
        question: "Funciona no celular?",
        answer:
          "Sim! O PDFfULL é otimizado para celulares. Você pode tirar fotos diretamente pela câmera ou selecionar imagens da galeria. Também pode instalar o app na tela inicial como um aplicativo nativo (PWA).",
      },
      {
        question: "Como instalar o PDFfULL no celular?",
        answer:
          'No Chrome (Android): acesse www.pdf-full.com, toque no menu (⋮) e selecione "Adicionar à tela inicial". No Safari (iOS): toque no botão compartilhar e selecione "Adicionar à Tela de Início".',
      },
      {
        question: "Preciso criar conta para usar?",
        answer:
          "Sim, é necessário criar uma conta gratuita. Aceeitamos login via Google (rápido, com 1 clique) ou por email com link mágico (sem senha).",
      },
    ],
  },
  {
    title: "Planos e Limites",
    items: [
      {
        question: "O PDFfULL é gratuito?",
        answer:
          "Sim! O plano Free permite até 5 conversões por mês sem custo. Para uso ilimitado, oferecemos o plano Pro por R$ 9,90/mês.",
      },
      {
        question: "Quais as diferenças entre Free e Pro?",
        answer:
          "O plano Free permite 5 conversões/mês com todas as funcionalidades básicas (conversão, download, compartilhamento). O plano Pro oferece conversões ilimitadas, armazenamento na nuvem e histórico completo.",
      },
      {
        question: "Como assinar o plano Pro?",
        answer:
          'Acesse Conta > Upgrade para Pro. O pagamento é feito pelo Mercado Pago (cartão de crédito, PIX ou boleto). A assinatura é mensal (R$ 9,90) e pode ser cancelada a qualquer momento.',
      },
      {
        question: "Quando o limite mensal é resetado?",
        answer:
          "O contador de conversões é zerado automaticamente no dia 1 de cada mês.",
      },
      {
        question: "Posso cancelar o plano Pro?",
        answer:
          'Sim, a qualquer momento. Acesse Conta > Cancelar assinatura. Você continuará com acesso Pro até o fim do período pago. Depois, volta para o plano Free.',
      },
    ],
  },
  {
    title: "Funcionalidades",
    items: [
      {
        question: "Como compartilhar um PDF?",
        answer:
          "Após gerar o PDF, clique em \"Compartilhar\". Você pode enviar por WhatsApp, Email, SMS ou copiar o link. No celular, também é possível usar o compartilhamento nativo do sistema operacional.",
      },
      {
        question: "Posso acessar PDFs antigos?",
        answer:
          "Sim! Todos os seus PDFs ficam salvos no Histórico. Lá você pode baixar, compartilhar ou excluir qualquer conversão anterior.",
      },
      {
        question: "É possível selecionar e excluir vários PDFs de uma vez?",
        answer:
          'Sim. Na página Histórico, use "Selecionar todos" ou marque os PDFs individualmente. Depois, use os botões de ação em lote para compartilhar ou excluir vários de uma vez.',
      },
      {
        question: "A conversão é feita no servidor?",
        answer:
          "Não. A compressão das imagens e a geração do PDF acontecem inteiramente no seu dispositivo (processamento local). Isso garante velocidade e privacidade. Apenas o PDF final é enviado para a nuvem para armazenamento.",
      },
    ],
  },
  {
    title: "Privacidade e Segurança",
    items: [
      {
        question: "Minhas fotos são seguras?",
        answer:
          "Sim. As fotos são processadas localmente no seu dispositivo e nunca são enviadas para nossos servidores. Apenas o PDF final gerado é armazenado na nuvem de forma segura e criptografada.",
      },
      {
        question: "Quem pode ver meus PDFs?",
        answer:
          "Apenas você. Todos os dados são protegidos por Row Level Security (RLS) — uma camada de segurança que garante que cada usuário só acessa seus próprios documentos.",
      },
      {
        question: "O PDFfULL está de acordo com a LGPD?",
        answer:
          "Sim. Cumprimos integralmente a Lei Geral de Proteção de Dados (LGPD). Veja nossa Política de Privacidade para detalhes sobre coleta, uso e proteção dos seus dados.",
      },
      {
        question: "Posso excluir meus dados?",
        answer:
          "Sim. Você pode excluir seus PDFs a qualquer momento pelo Histórico. Para excluir sua conta completamente, entre em contato conosco.",
      },
    ],
  },
  {
    title: "Problemas Comuns",
    items: [
      {
        question: "A câmera não abre no navegador.",
        answer:
          'Verifique se você concedeu permissão de câmera ao navegador. Em dispositivos Android, acesse Configurações > Aplicativos > Chrome > Permissões > Câmera. No iOS, vá em Ajustes > Safari > Câmera. Se o problema persistir, use a opção "Selecionar da galeria".',
      },
      {
        question: '"Limite mensal atingido" — o que fazer?',
        answer:
          "No plano Free, você tem 5 conversões por mês. Para continuar convertendo, faça upgrade para o plano Pro (R$ 9,90/mês = ilimitado) ou aguarde o próximo mês para o reset automático.",
      },
      {
        question: "O PDF ficou com qualidade ruim.",
        answer:
          "As imagens são comprimidas automaticamente para otimizar o tamanho do PDF. Para melhor resultado, tire fotos com boa iluminação e evite tremores. Imagens com resolução mínima de 1920px produzem bons resultados.",
      },
    ],
  },
];

function FaqAccordionItem({ item }: { item: FaqItem }) {
  return (
    <details className="group rounded-lg border bg-white">
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition [&::-webkit-details-marker]:hidden list-none">
        <span>{item.question}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {item.answer}
      </div>
    </details>
  );
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-10 text-center">
        <div className="flex justify-center mb-4">
          <HelpCircle className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Perguntas Frequentes
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tudo o que você precisa saber sobre o PDFfULL
        </p>
      </div>

      <div className="space-y-8">
        {faqSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <FaqAccordionItem key={item.question} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border bg-blue-50 border-blue-200 p-6 text-center">
        <p className="font-medium text-blue-900">
          Não encontrou o que procurava?
        </p>
        <p className="text-sm text-blue-700 mt-1">
          Consulte nossos{" "}
          <Link href="/termos" className="underline hover:no-underline">
            Termos de Uso
          </Link>{" "}
          ou nossa{" "}
          <Link href="/privacidade" className="underline hover:no-underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Voltar para o início
        </Link>
      </div>
    </div>
  );
}
