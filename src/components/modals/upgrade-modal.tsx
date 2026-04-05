"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink, Loader2, ShieldCheck, X, Zap } from "lucide-react";

const PRO_BENEFITS = [
  "Conversões ilimitadas",
  "Histórico completo na nuvem",
  "PDFs salvos no Cloudflare R2",
  "Suporte prioritário",
];

type Phase = "confirm" | "loading" | "error";

export function UpgradeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [phase, setPhase] = useState<Phase>("confirm");
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  const handleClose = () => {
    if (phase !== "loading") {
      setPhase("confirm");
      setErrorMsg("");
      onOpenChange(false);
    }
  };

  const handleCheckout = async () => {
    setPhase("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar pagamento.");
      }

      if (!data.url) {
        throw new Error("Link de pagamento indisponível. Tente novamente.");
      }

      window.location.href = data.url;
    } catch (err) {
      setPhase("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="relative my-8 w-full max-w-md rounded-2xl bg-background shadow-2xl ring-1 ring-border">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Assinar plano
            </p>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              PDFfULL Pro
            </h2>
            <p className="text-sm text-muted-foreground">
              R$ 9,90/mês · Cancele quando quiser
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={phase === "loading"}
            className="ml-4 mt-0.5 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="px-6 py-5 space-y-4">
          {/* Erro */}
          {phase === "error" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-medium text-destructive">{errorMsg}</p>
              <button
                onClick={() => setPhase("confirm")}
                className="mt-1 text-xs text-destructive/70 underline hover:text-destructive"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Benefícios */}
          <ul className="space-y-2">
            {PRO_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-green-600 shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>

          {/* Informação de redirecionamento */}
          <p className="text-sm text-muted-foreground">
            Você será redirecionado para o ambiente seguro do Mercado Pago para
            inserir os dados do cartão e confirmar a assinatura.
          </p>

          {/* Resumo */}
          <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plano</span>
              <span className="font-medium">PDFfULL Pro</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor</span>
              <span className="font-medium">R$ 9,90/mês</span>
            </div>
          </div>

          {/* Botão principal */}
          <Button
            className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-base"
            onClick={handleCheckout}
            disabled={phase === "loading"}
          >
            {phase === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparando pagamento...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Ir para o Mercado Pago
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Pagamento processado com segurança pelo Mercado Pago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
