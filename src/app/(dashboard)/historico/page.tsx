import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Conversion } from "@/types";
import { FileText, Download } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function HistoricoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: conversions } = await supabase
    .from("conversions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (conversions ?? []) as Conversion[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico</h1>
        <p className="text-muted-foreground mt-1">
          Suas últimas conversões
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>Nenhuma conversão ainda.</p>
          <a href="/converter" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Fazer primeira conversão
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border p-4 bg-white"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-8 w-8 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.pages} {c.pages === 1 ? "página" : "páginas"} •{" "}
                    {formatBytes(c.size_bytes)} •{" "}
                    {formatDate(c.created_at)}
                  </p>
                </div>
              </div>
              {c.pdf_url && (
                <a
                  href={c.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 ml-4 rounded-lg border p-2 hover:bg-gray-50 transition"
                >
                  <Download className="h-5 w-5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
