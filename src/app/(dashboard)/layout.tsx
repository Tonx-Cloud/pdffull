import { TermsAcceptanceModal } from "@/components/modals/terms-acceptance-modal";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
      <TermsAcceptanceModal />
    </div>
  );
}
