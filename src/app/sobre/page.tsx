import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, Zap, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre Nós — PDFfULL",
  description: "Conheça o PDFfULL: conversor instantâneo de fotos em PDF, feito no Brasil.",
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <FileText className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">PDFfULL</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Conversor instantâneo de fotos em PDF
        </p>
      </div>

      <div className="prose prose-sm max-w-none">
        <h2>Nossa Missão</h2>
        <p>
          O PDFfULL nasceu para resolver um problema simples: transformar fotos de documentos
          em PDFs organizados, de forma <strong>rápida, segura e gratuita</strong>. Sem apps
          pesados, sem cadastros desnecessários, sem publicidade invasiva.
        </p>

        <h2>Como Funciona</h2>
        <div className="not-prose grid gap-4 my-6">
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <Zap className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Processamento Local</p>
              <p className="text-sm text-muted-foreground">
                Suas fotos são convertidas diretamente no seu dispositivo.
                Nenhuma imagem é enviada para nossos servidores durante a conversão.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Privacidade em Primeiro Lugar</p>
              <p className="text-sm text-muted-foreground">
                Criptografia em trânsito (TLS) e em repouso. Seus dados são protegidos
                por Row Level Security — só você acessa seus documentos.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <Users className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Feito no Brasil</p>
              <p className="text-sm text-muted-foreground">
                Desenvolvido por brasileiros, para brasileiros. Pagamento via Mercado Pago,
                suporte em português, conformidade com a LGPD.
              </p>
            </div>
          </div>
        </div>

        <h2>Planos</h2>
        <ul>
          <li><strong>Gratuito:</strong> 5 conversões por mês, sem necessidade de cadastro para converter.</li>
          <li><strong>Pro (R$ 9,90/mês):</strong> conversões ilimitadas, histórico na nuvem, suporte prioritário.</li>
        </ul>

        <h2>Tecnologia</h2>
        <p>
          Construído com tecnologias modernas e confiáveis: Next.js, React, Supabase,
          Cloudflare R2 e Vercel. O app funciona como um PWA — instalável direto no
          celular, sem precisar de loja de aplicativos.
        </p>

        <h2>Contato</h2>
        <p>
          Dúvidas, sugestões ou problemas? Entre em contato:
        </p>
        <ul>
          <li>Email: <a href="mailto:contato@pdffull.com.br" className="text-blue-600">contato@pdffull.com.br</a></li>
        </ul>

        <hr />
        <p className="text-sm">
          <Link href="/termos" className="text-blue-600 hover:underline">
            Termos de Uso
          </Link>
          {" • "}
          <Link href="/privacidade" className="text-blue-600 hover:underline">
            Privacidade
          </Link>
          {" • "}
          <Link href="/" className="text-blue-600 hover:underline">
            Voltar ao início
          </Link>
        </p>
      </div>
    </div>
  );
}
