"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";

const LOCALES = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
] as const;

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    document.cookie = `locale=${newLocale};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
    router.refresh();
  };

  return (
    <div className="relative inline-flex items-center" title="Idioma / Language">
      <Globe className="h-4 w-4 absolute left-3 pointer-events-none text-gray-500 stroke-[1.75]" />
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none cursor-pointer rounded-xl border border-[#E5E7EB] bg-white/70 pl-9 pr-3 py-2 text-sm font-medium text-gray-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:bg-white hover:shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08)] hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label="Idioma / Language"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag}
          </option>
        ))}
      </select>
    </div>
  );
}
