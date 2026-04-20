import { FileText, Camera, Zap, Shield, ArrowRight, Mail, CheckCircle, Layers, Brain, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { PwaShareButton } from "@/components/pwa/pwa-share-button";
import { LanguageSelector } from "@/components/layout/language-selector";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header — Navegação completa para sitelinks do Google */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            PDFfULL
          </Link>
          <nav className="hidden md:flex gap-6 items-center text-sm">
            <Link href="/sobre" className="text-muted-foreground hover:text-blue-600 transition-colors">
              Sobre
            </Link>
            <Link href="/faq" className="text-muted-foreground hover:text-blue-600 transition-colors">
              FAQ
            </Link>
            <Link href="/converter" className="text-muted-foreground hover:text-blue-600 transition-colors">
              Converter
            </Link>
            <LanguageSelector />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/converter">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Converter Agora
              </Button>
            </Link>
          </nav>
          <nav className="flex md:hidden gap-2 items-center">
            <LanguageSelector />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/converter">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Converter
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="flex flex-col items-center justify-center gap-6 px-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100">
            <FileText className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight max-w-lg">
            Foto em PDF.
            <br />
            <span className="text-blue-600">Um clique.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md">
            Tire uma foto ou carregue da galeria e converta instantaneamente em
            PDF otimizado. Sem instalar nada.
          </p>
          <Link href="/converter">
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Camera className="h-5 w-5" />
              Converter Agora — Grátis
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            2 conversões grátis sem cadastro • 5 com conta gratuita
          </p>
          <div className="flex gap-2 mt-2">
            <PwaInstallButton />
            <PwaShareButton />
          </div>
        </section>

        {/* Como Funciona — 3 passos simples e objetivos */}
        <section className="border-t bg-gray-50 px-4 py-16">
          <div className="mx-auto max-w-4xl text-center mb-10">
            <h2 className="text-2xl font-bold">Como Funciona</h2>
            <p className="text-muted-foreground mt-2">Simples, rápido e direto ao ponto</p>
          </div>
          <div className="mx-auto max-w-4xl grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold">Tire a Foto</h3>
              <p className="text-sm text-muted-foreground">
                Abra a câmera do celular ou carregue uma imagem da galeria direto pelo navegador.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold">Converta em PDF</h3>
              <p className="text-sm text-muted-foreground">
                A conversão acontece no seu celular, sem enviar para servidores. Rápido, privado e offline.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold">Baixe ou Compartilhe</h3>
              <p className="text-sm text-muted-foreground">
                Download direto, envie por WhatsApp, Email ou SMS. Pronto em segundos.
              </p>
            </div>
          </div>
          {/* CTA intermediário */}
          <div className="text-center mt-10">
            <Link href="/converter">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Camera className="h-5 w-5" />
                Experimentar Grátis
              </Button>
            </Link>
          </div>
        </section>

        {/* Funcionalidades */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl text-center mb-10">
            <h2 className="text-2xl font-bold">Tudo que Você Precisa</h2>
          </div>
          <div className="mx-auto max-w-4xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border p-5">
              <Camera className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Câmera Direta</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Capture documentos, notas ou recibos direto do navegador.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border p-5">
              <Zap className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Conversão Instantânea</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF gerado localmente, rápido e sem enviar dados.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border p-5">
              <Layers className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Múltiplas Páginas</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Junte várias fotos em um único PDF. Reordene antes de gerar.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border p-5">
              <Brain className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Análise com IA</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Extraia texto (OCR) e analise documentos com inteligência artificial.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border p-5">
              <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Privacidade Total</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Processamento local. Suas fotos não saem do seu dispositivo.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border p-5">
              <Globe className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">6 Idiomas</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Disponível em português, inglês, espanhol, chinês, hindi e árabe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="planos" className="border-t bg-gray-50 px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-2">Planos</h2>
            <p className="text-muted-foreground mb-8">Comece grátis, evolua quando precisar</p>
            <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
              <div className="rounded-2xl border bg-white p-6 text-left">
                <h3 className="font-semibold text-lg">Free</h3>
                <p className="text-3xl font-bold mt-2">
                  R$ 0<span className="text-sm font-normal">/mês</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 2 conversões sem cadastro</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 5 conversões/mês com conta</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Download direto</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Funciona offline</li>
                </ul>
                <Link href="/register" className="block mt-6">
                  <Button variant="outline" className="w-full">
                    Criar Conta Grátis
                  </Button>
                </Link>
              </div>
              <div className="rounded-2xl border-2 border-blue-600 bg-white p-6 text-left relative">
                <span className="absolute -top-3 left-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  Popular
                </span>
                <h3 className="font-semibold text-lg">Pro</h3>
                <p className="text-3xl font-bold mt-2">
                  R$ 9,90<span className="text-sm font-normal">/mês</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> Conversões ilimitadas</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> Múltiplas fotos → 1 PDF</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> Histórico na nuvem</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> Links de compartilhamento</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> Suporte prioritário</li>
                </ul>
                <Link href="/converter" className="block mt-6">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Assinar Pro
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">Pronto para converter?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Comece agora mesmo, sem cadastro. É grátis, rápido e seguro.
          </p>
          <Link href="/converter">
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              Converter Agora
            </Button>
          </Link>
        </section>

        {/* Contato */}
        <section className="border-t bg-gray-50 px-4 py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-xl font-bold mb-2">Precisa de Ajuda?</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Confira nossas perguntas frequentes ou entre em contato direto.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/faq">
                <Button variant="outline" className="gap-2">
                  Ver FAQ
                </Button>
              </Link>
              <a href="mailto:contato@pdffull.com.br">
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  contato@pdffull.com.br
                </Button>
              </a>
              <a href="https://wa.me/5511999999999?text=Olá, preciso de ajuda com o PDFfULL" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer expandido — sitelinks para SEO */}
      <footer className="border-t bg-white px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-3 text-sm">
            <div>
              <p className="font-semibold text-blue-600 mb-3">PDFfULL</p>
              <p className="text-muted-foreground text-xs">
                Conversor instantâneo de fotos em PDF. Rápido, seguro e gratuito.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-3">Navegação</p>
              <nav className="flex flex-col gap-2 text-muted-foreground">
                <Link href="/converter" className="hover:text-blue-600 transition-colors">Converter PDF</Link>
                <Link href="/sobre" className="hover:text-blue-600 transition-colors">Sobre Nós</Link>
                <Link href="/faq" className="hover:text-blue-600 transition-colors">Perguntas Frequentes</Link>
              </nav>
            </div>
            <div>
              <p className="font-semibold mb-3">Legal</p>
              <nav className="flex flex-col gap-2 text-muted-foreground">
                <Link href="/termos" className="hover:text-blue-600 transition-colors">Termos de Uso</Link>
                <Link href="/privacidade" className="hover:text-blue-600 transition-colors">Privacidade</Link>
                <a href="mailto:contato@pdffull.com.br" className="hover:text-blue-600 transition-colors">Contato</a>
              </nav>
            </div>
          </div>
          <div className="border-t mt-6 pt-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} PDFfULL. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
