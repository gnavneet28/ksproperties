import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid flex-1 lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative isolate hidden overflow-hidden bg-green-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative static SVG */}
        <img
          src="/hero-masterplan.svg"
          alt=""
          className="pointer-events-none absolute -right-40 top-10 -z-10 w-[760px] max-w-none rotate-[-8deg] opacity-30"
        />
        <Logo className="h-10 w-auto" />
        <div>
          <p className="eyebrow text-gold-400">Lead desk</p>
          <h1 className="mt-4 max-w-md text-[40px] leading-[1.1]">Every enquiry, from first click to booking.</h1>
          <p className="mt-4 max-w-sm text-white/70">Track new leads, schedule site visits and follow-ups, and see which campaigns convert.</p>
        </div>
        <p className="text-xs text-white/50">Restricted area · KS Properties team only</p>
      </aside>
      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <div className="inline-block rounded-xl bg-green-950 px-3 py-2">
              <Logo className="h-8 w-auto" />
            </div>
          </div>
          <h2 className="text-[28px] leading-tight">Sign in</h2>
          <p className="mt-1.5 text-sm text-muted">Use the email and password your admin gave you.</p>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
