export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">PDFfULL</h1>
          <nav className="flex gap-4 text-sm">
            <a href="/converter" className="hover:text-blue-600">
              Converter
            </a>
            <a href="/historico" className="hover:text-blue-600">
              Histórico
            </a>
            <a href="/conta" className="hover:text-blue-600">
              Conta
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
