import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/Toast";

export const metadata: Metadata = {
  title: { default: "Dashboard · KS Properties Admin", template: "%s · KS Properties Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="admin on-light flex flex-1 flex-col bg-[#f5f4ef] text-ink">
      <ToastProvider>{children}</ToastProvider>
    </div>
  );
}
