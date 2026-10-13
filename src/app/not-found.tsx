import type { Metadata } from "next";
import Link from "next/link";
import { content } from "@/content";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: content.notFound.heading, robots: { index: false } };

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center bg-green-950 px-4 py-20 text-center text-white">
      <Logo className="h-10 w-auto" />
      <p className="eyebrow mt-12 text-gold-400">404</p>
      <h1 className="mt-3 text-[40px]">{content.notFound.heading}</h1>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-[52px] cursor-pointer items-center rounded-xl bg-gold-500 px-7 font-medium text-ink transition-colors duration-200 hover:bg-gold-300"
      >
        {content.notFound.cta}
      </Link>
    </section>
  );
}
