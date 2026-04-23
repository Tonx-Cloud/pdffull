"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { LanguageSelector } from "@/components/layout/language-selector";
import { Menu, X } from "lucide-react";

export function DashboardHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("Nav");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const navLinks = (
    <>
      <LanguageSelector />
      <PwaInstallButton />
      <Link
        href="/converter"
        className="hover:text-blue-600"
        onClick={() => setMenuOpen(false)}
      >
        {t("converter")}
      </Link>
      <Link
        href="/leitor"
        className="hover:text-blue-600"
        onClick={() => setMenuOpen(false)}
      >
        Ler PDF
      </Link>
      {isLoggedIn === null ? null : isLoggedIn ? (
        <>
          <Link
            href="/historico"
            className="hover:text-blue-600"
            onClick={() => setMenuOpen(false)}
          >
            {t("history")}
          </Link>
          <Link
            href="/conta"
            className="hover:text-blue-600"
            onClick={() => setMenuOpen(false)}
          >
            {t("account")}
          </Link>
        </>
      ) : (
        <Link
          href="/login"
          className="text-blue-600 font-medium hover:underline"
          onClick={() => setMenuOpen(false)}
        >
          {t("login")}
        </Link>
      )}
    </>
  );

  return (
    <header className="border-b bg-white px-4 py-3 relative">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          PDFfULL
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-3 text-sm">
          {navLinks}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <nav className="md:hidden absolute left-0 right-0 top-full bg-white border-b shadow-lg z-50 px-4 py-4 flex flex-col gap-3 text-sm">
          {navLinks}
        </nav>
      )}
    </header>
  );
}
