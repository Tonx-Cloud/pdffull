"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/modals/upgrade-modal";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function ContaActions({ plan }: { readonly plan: "free" | "pro" }) {
  const t = useTranslations("Account");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!globalThis.confirm(t("confirmCancel"))) return;

    setCancelling(true);
    const res = await fetch("/api/cancel-subscription", { method: "POST" });

    if (res.ok) {
      toast.success(t("cancelSuccess"));
      globalThis.location.reload();
    } else {
      toast.error(t("cancelError"));
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
          {t("upgradeButton")}
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
      {t("cancelButton")}
    </button>
  );
}
