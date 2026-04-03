import { FileText, Camera, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">PDFfULL</h1>
          <nav className="flex gap-3">
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
          <h2 className="text-4xl font-bold tracking-tight max-w-lg">
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
            5 conversões grátis por mês • Sem cadastro necessário
          </p>
        </section>

        {/* Features */}
        <section className="border-t bg-gray-50 px-4 py-16">
          <div className="mx-auto max-w-4xl grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Câmera Direta</h3>
              <p className="text-sm text-muted-foreground">
                Abra a câmera do celular e capture documentos, notas ou recibos
                direto pelo navegador.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Conversão Instantânea</h3>
              <p className="text-sm text-muted-foreground">
                PDF gerado no seu celular, sem enviar para servidores. Rápido,
                privado e offline.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Múltiplas Páginas</h3>
              <p className="text-sm text-muted-foreground">
                Junte várias fotos em um único PDF multi-página. Reordene e
                remova antes de gerar.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-8">Planos</h2>
            <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
              <div className="rounded-2xl border p-6 text-left">
                <h3 className="font-semibold text-lg">Free</h3>
                <p className="text-3xl font-bold mt-2">
                  R$ 0<span className="text-sm font-normal">/mês</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>✓ 5 conversões por mês</li>
                  <li>✓ Foto única → PDF</li>
                  <li>✓ Download direto</li>
                  <li>✓ Funciona offline</li>
                </ul>
              </div>
              <div className="rounded-2xl border-2 border-blue-600 p-6 text-left relative">
                <span className="absolute -top-3 left-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  Popular
                </span>
                <h3 className="font-semibold text-lg">Pro</h3>
                <p className="text-3xl font-bold mt-2">
                  R$ 9,90<span className="text-sm font-normal">/mês</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>✓ Conversões ilimitadas</li>
                  <li>✓ Múltiplas fotos → 1 PDF</li>
                  <li>✓ Histórico na nuvem</li>
                  <li>✓ Links de compartilhamento</li>
                  <li>✓ Suporte prioritário</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white px-4 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} PDFfULL. Todos os direitos reservados.
      </footer>
    </div>
  );
}
