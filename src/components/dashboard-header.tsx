"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { PwaInstallButton } from "@/components/pwa-install-button";

export function DashboardHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  return (
    <header className="border-b bg-white px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          PDFfULL
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <PwaInstallButton />
          <Link href="/converter" className="hover:text-blue-600">
            Converter
          </Link>
          {isLoggedIn === null ? null : isLoggedIn ? (
            <>
              <Link href="/historico" className="hover:text-blue-600">
                Histórico
              </Link>
              <Link href="/conta" className="hover:text-blue-600">
                Conta
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
