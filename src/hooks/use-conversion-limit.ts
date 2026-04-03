"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ConversionLimit } from "@/types";

const FREE_LIMIT = 5;
const ANON_LIMIT = 2;
const POLL_INTERVAL = 30_000; // 30 segundos
const ANON_STORAGE_KEY = "pdffull_anon_conversions";

function getAnonUsage(): number {
  if (typeof window === "undefined") return 0;
  try {
    const stored = JSON.parse(localStorage.getItem(ANON_STORAGE_KEY) || '{"count":0,"month":""}');
    const currentMonth = new Date().toISOString().slice(0, 7);
    return stored.month === currentMonth ? stored.count : 0;
  } catch {
    return 0;
  }
}

export function useConversionLimit(): ConversionLimit & { loading: boolean; refresh: () => void; isAnon: boolean } {
  const [state, setState] = useState<ConversionLimit & { loading: boolean; isAnon: boolean }>({
    used: 0,
    max: FREE_LIMIT,
    canConvert: true,
    plan: "free",
    loading: true,
    isAnon: false,
  });

  const fetchLimit = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Modo anônimo: usa localStorage
      const anonUsed = getAnonUsage();
      setState({
        used: anonUsed,
        max: ANON_LIMIT,
        canConvert: anonUsed < ANON_LIMIT,
        plan: "free",
        loading: false,
        isAnon: true,
      });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, conversions_this_month, conversions_reset_at")
      .eq("id", user.id)
      .single();

    if (!profile) {
      setState({ used: 0, max: FREE_LIMIT, canConvert: true, plan: "free", loading: false, isAnon: false });
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

    setState({ used, max, canConvert, plan, loading: false, isAnon: false });
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
