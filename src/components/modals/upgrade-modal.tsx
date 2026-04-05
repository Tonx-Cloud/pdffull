"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Check, Loader2, Zap } from "lucide-react";

const PRO_BENEFITS = [
  "Conversões ilimitadas",
  "Histórico completo na nuvem",
  "PDFs salvos no Cloudflare R2",
  "Suporte prioritário",
];

export function UpgradeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao processar pagamento.");
        return;
      }

      if (!data.url) {
        setError("Link de pagamento indisponível. Tente novamente.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Upgrade para Pro
          </DialogTitle>
          <DialogDescription>
            Desbloqueie conversões ilimitadas por apenas R$ 9,90/mês
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <ul className="space-y-3">
            {PRO_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-green-600 shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>

          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <span className="text-3xl font-bold text-blue-600">R$ 9,90</span>
            <span className="text-muted-foreground">/mês</span>
          </div>

          <Button
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Assinar agora"
            )}
          </Button>

          {error && (
            <p className="text-sm text-center text-red-600 font-medium">
              {error}
            </p>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Pagamento seguro via Mercado Pago. Cancele quando quiser.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
