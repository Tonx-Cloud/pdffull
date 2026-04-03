"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ConversionLimit } from "@/types";

const FREE_LIMIT = 5;
const POLL_INTERVAL = 30_000; // 30 segundos

export function useConversionLimit(): ConversionLimit & { loading: boolean; refresh: () => void } {
  const [state, setState] = useState<ConversionLimit & { loading: boolean }>({
    used: 0,
    max: FREE_LIMIT,
    canConvert: true,
    plan: "free",
    loading: true,
  });

  const fetchLimit = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setState({ used: 0, max: FREE_LIMIT, canConvert: true, plan: "free", loading: false });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, conversions_this_month, conversions_reset_at")
      .eq("id", user.id)
      .single();

    if (!profile) {
      setState({ used: 0, max: FREE_LIMIT, canConvert: true, plan: "free", loading: false });
      return;
    }

    // Reset mensal client-side check
    let used = profile.conversions_this_month;
    const resetAt = new Date(profile.conversions_reset_at);
    if (new Date() >= resetAt) {
      used = 0;
    }

    const plan = profile.plan as "free" | "pro";
    const max = plan === "pro" ? Infinity : FREE_LIMIT;
    const canConvert = plan === "pro" || used < FREE_LIMIT;

    setState({ used, max, canConvert, plan, loading: false });
  }, []);

  useEffect(() => {
    fetchLimit();

    // Polling a cada 30s para manter sincronizado entre dispositivos
    const interval = setInterval(fetchLimit, POLL_INTERVAL);

    // Refetch quando a aba ganha foco (ex: voltou do celular para o PC)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchLimit();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchLimit]);

  return { ...state, refresh: fetchLimit };
}
