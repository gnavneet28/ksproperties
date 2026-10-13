import type { Metadata } from "next";
import { content } from "@/content";
import { ThankYou } from "./ThankYou";

export const metadata: Metadata = {
  title: content.seo.thankYouTitle,
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return <ThankYou />;
}
