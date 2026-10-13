import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a2b1e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Bare document shell shared by the public site (app/(site)) and the admin (app/admin). */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${manrope.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
