import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/types";
import { ContaActions } from "@/components/account/conta-actions";
import { getTranslations, getLocale } from "next-intl/server";

export default async function ContaPage() {
  const supabase = await createClient();
  const t = await getTranslations("Account");
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = data as Profile | null;

  const used = profile?.conversions_this_month ?? 0;
  const plan = profile?.plan ?? "free";
  const max = plan === "pro" ? "∞" : "5";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      {/* Perfil */}
      <div className="rounded-xl border p-6 bg-white space-y-4">
        <h2 className="font-semibold text-lg">{t("profileTitle")}</h2>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("name")}</span>
            <span className="font-medium">{profile?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("email")}</span>
            <span className="font-medium">{profile?.email ?? user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("memberSince")}</span>
            <span className="font-medium">
              {profile
                ? new Date(profile.created_at).toLocaleDateString(locale)
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Plano */}
      <div className="rounded-xl border p-6 bg-white space-y-4">
        <h2 className="font-semibold text-lg">{t("currentPlan")}</h2>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              plan === "pro"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {plan === "pro" ? t("planPro") : t("planFree")}
          </span>
          {plan === "pro" && (
            <span className="text-sm text-muted-foreground">{t("proPrice")}</span>
          )}
        </div>

        {/* Uso mensal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("conversionsThisMonth")}</span>
            <span className="font-medium">
              {used} / {max}
            </span>
          </div>
          {plan === "free" && (
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((used / 5) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>

        <ContaActions plan={plan} />
      </div>

      {/* Sair */}
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="text-sm text-red-600 hover:underline"
        >
          {t("logout")}
        </button>
      </form>
    </div>
  );
}
