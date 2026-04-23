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
      <Globe className="h-4 w-4 absolute left-1.5 pointer-events-none text-gray-500" />
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none bg-transparent pl-6 pr-1 py-1.5 text-sm rounded-lg border hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
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
