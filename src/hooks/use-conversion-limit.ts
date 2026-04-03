"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ConversionLimit } from "@/types";

const FREE_LIMIT = 5;

export function useConversionLimit(): ConversionLimit & { loading: boolean; refresh: () => void } {
  const [state, setState] = useState<ConversionLimit & { loading: boolean }>({
    used: 0,
    max: FREE_LIMIT,
    canConvert: true,
    plan: "free",
    loading: true,
  });

  const fetch = async () => {
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
  };

  useEffect(() => {
    fetch();
  }, []);

  return { ...state, refresh: fetch };
}
