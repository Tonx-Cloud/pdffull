"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/modals/upgrade-modal";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ContaActions({ plan }: { plan: "free" | "pro" }) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Tem certeza que deseja cancelar o plano Pro?")) return;

    setCancelling(true);
    const res = await fetch("/api/cancel-subscription", { method: "POST" });

    if (res.ok) {
      toast.success("Assinatura cancelada. Seu plano voltou para Gratuito.");
      window.location.reload();
    } else {
      toast.error("Erro ao cancelar. Tente novamente.");
    }
    setCancelling(false);
  };

  if (plan === "free") {
    return (
      <>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowUpgrade(true)}
        >
          Fazer upgrade para Pro
        </Button>
        <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
      </>
    );
  }

  return (
    <button
      onClick={handleCancel}
      disabled={cancelling}
      className="text-sm text-red-600 hover:underline inline-flex items-center gap-1"
    >
      {cancelling && <Loader2 className="h-3 w-3 animate-spin" />}
      Cancelar assinatura
    </button>
  );
}
