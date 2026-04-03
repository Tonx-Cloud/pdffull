// Placeholder — Fase 2: Hook para verificar limite de conversões
import type { ConversionLimit } from "@/types";

export function useConversionLimit(): ConversionLimit {
  // Será implementado na Fase 2
  return {
    used: 0,
    max: 5,
    canConvert: true,
    plan: "free",
  };
}
