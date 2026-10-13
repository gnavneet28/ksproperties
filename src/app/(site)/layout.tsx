import type { Metadata } from "next";
import { content, launchBlockers } from "@/content";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBar } from "@/components/MobileBar";
import { WhatsAppFab } from "@/components/WhatsAppFab";

if (process.env.NODE_ENV === "production") {
  const blockers = launchBlockers();
  if (blockers.length) console.warn(`\n⚠ Launch blockers in src/content:\n  - ${blockers.join("\n  - ")}\n`);
}

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: content.brand.name,
    title: content.seo.title,
    description: content.seo.description,
  },
  twitter: { card: "summary_large_image", title: content.seo.title, description: content.seo.description },
};

// No analytics, pixels or cookies on the public site (see privacy policy section 7).
// src/components/Analytics.tsx is kept but not mounted, in case tracking is enabled later.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="site-shell flex flex-1 flex-col">
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileBar />
      <WhatsAppFab />
    </div>
  );
}
