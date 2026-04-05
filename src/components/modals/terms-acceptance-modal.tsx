"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function TermsAcceptanceModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("terms_accepted_at")
        .eq("id", user.id)
        .single();

      if (profile && !profile.terms_accepted_at) {
        setOpen(true);
      }
    }
    check();
  }, [supabase]);

  const handleAccept = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ terms_accepted_at: new Date().toISOString() })
      .eq("id", user.id);

    setOpen(false);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Termos de Uso e Privacidade</DialogTitle>
          <DialogDescription>
            Para continuar usando o PDFfULL, leia e aceite nossos termos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm text-muted-foreground">
          <p>
            Ao clicar em &quot;Aceitar e continuar&quot;, você declara que leu e
            concorda com:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <Link
                href="/termos"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link
                href="/privacidade"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Política de Privacidade
              </Link>
            </li>
          </ul>
        </div>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={handleAccept}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Aceitar e continuar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
