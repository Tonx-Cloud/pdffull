"use client";

import Link from "next/link";
import { Lock, UserPlus, LogIn, X, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface AuthRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Action requested ("download" | "share") used only para copy. */
  action?: "download" | "share";
  /** Path para retornar após login (ex.: /converter). */
  redirectTo?: string;
}

export function AuthRequiredModal({
  open,
  onOpenChange,
  action = "download",
  redirectTo = "/converter",
}: AuthRequiredModalProps) {
  const t = useTranslations("AuthRequired");

  if (!open) return null;

  const next = encodeURIComponent(redirectTo);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative my-8 w-full max-w-md rounded-2xl bg-background shadow-2xl ring-1 ring-border">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-gray-100"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
              <Lock className="h-7 w-7 text-blue-600" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">
              {action === "share" ? t("titleShare") : t("titleDownload")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <span>{t("benefit1")}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <span>{t("benefit2")}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <span>{t("benefit3")}</span>
            </li>
          </ul>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href={`/register?next=${next}`}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white h-11 px-4 text-sm font-medium transition"
            >
              <UserPlus className="h-4 w-4" />
              {t("ctaRegister")}
            </Link>
            <Link
              href={`/login?next=${next}`}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background hover:bg-accent h-11 px-4 text-sm font-medium transition"
            >
              <LogIn className="h-4 w-4" />
              {t("ctaLogin")}
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground">{t("note")}</p>
        </div>
      </div>
    </div>
  );
}
