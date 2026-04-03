import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export const SUPPORTED_LOCALES = ["pt", "en", "es", "zh", "hi", "ar"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "pt";

export const RTL_LOCALES: SupportedLocale[] = ["ar"];

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

function getLocaleFromAcceptLanguage(
  acceptLanguage: string
): SupportedLocale | null {
  const segments = acceptLanguage.split(",");
  for (const segment of segments) {
    const lang = segment.split(";")[0].trim().split("-")[0].toLowerCase();
    if (isSupportedLocale(lang)) return lang;
  }
  return null;
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const headersList = await headers();

  // 1. Cookie
  const cookieLocale = store.get("locale")?.value;
  if (cookieLocale && isSupportedLocale(cookieLocale)) {
    return {
      locale: cookieLocale,
      messages: (await import(`../../messages/${cookieLocale}.json`)).default,
    };
  }

  // 2. Accept-Language header
  const acceptLang = headersList.get("accept-language") || "";
  const detected = getLocaleFromAcceptLanguage(acceptLang);
  const locale = detected || DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
