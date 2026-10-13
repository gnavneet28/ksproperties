"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { logout } from "@/app/admin/actions";
import { Avatar } from "./ui";

type User = { name: string; email: string; role: "admin" | "sales" };
type Badges = { newLeads: number; due: number };

const icon = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const Icons = {
  overview: <svg {...icon}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>,
  leads: <svg {...icon}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>,
  followups: <svg {...icon}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>,
  team: <svg {...icon}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  account: <svg {...icon}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>,
  site: <svg {...icon}><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>,
  logout: <svg {...icon}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>,
  menu: <svg {...icon}><path d="M3 6h18M3 12h18M3 18h18" /></svg>,
  close: <svg {...icon}><path d="M18 6 6 18M6 6l12 12" /></svg>,
};

export function AdminShell({ user, badges, siteUrl, children }: { user: User; badges: Badges; siteUrl: string; children: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer on navigation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to route change
    setOpen(false);
  }, [pathname, search]);

  const followUpView = pathname === "/leads" && search.get("followUp") === "due";
  const items = [
    { href: "/", label: "Overview", icon: Icons.overview, active: pathname === "/" },
    { href: "/leads", label: "Leads", icon: Icons.leads, active: pathname.startsWith("/leads") && !followUpView, badge: badges.newLeads, badgeLabel: "new" },
    { href: "/leads?followUp=due", label: "Follow-ups", icon: Icons.followups, active: followUpView, badge: badges.due, badgeLabel: "due", alert: true },
    ...(user.role === "admin" ? [{ href: "/team", label: "Team", icon: Icons.team, active: pathname.startsWith("/team") }] : []),
    { href: "/account", label: "Account", icon: Icons.account, active: pathname.startsWith("/account") },
  ];

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col">
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              aria-current={it.active ? "page" : undefined}
              className={`group relative flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm transition-colors duration-200 ${
                it.active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {it.active && <span aria-hidden className="absolute -left-3 top-2.5 h-6 w-1 rounded-r bg-gold-400" />}
              <span className={it.active ? "text-gold-400" : "text-white/60 group-hover:text-white/80"}>{it.icon}</span>
              <span className="flex-1">{it.label}</span>
              {!!it.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${it.alert ? "bg-red-600 text-white" : "bg-gold-400 text-ink"}`}
                  aria-label={`${it.badge} ${it.badgeLabel}`}
                >
                  {it.badge}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-1 pt-6">
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm text-white/70 transition-colors duration-200 hover:bg-white/5 hover:text-white"
        >
          <span className="text-white/60">{Icons.site}</span>
          View website
        </a>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 p-3">
          <span className="rounded-full bg-white">
            <Avatar name={user.name} size={34} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-white">{user.name}</p>
            <p className="truncate text-xs capitalize text-white/55">{user.role}</p>
          </div>
          <form
            action={async () => {
              await logout();
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload on session change
              window.location.assign("/login");
            }}
          >
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              {Icons.logout}
            </button>
          </form>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex flex-1">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col bg-green-950 px-5 py-6 lg:flex">
        <Link href="/" className="mb-8 block px-1">
          <Logo className="h-9 w-auto" />
          <span className="eyebrow mt-2 block text-[10px] text-white/45">Lead desk</span>
        </Link>
        {nav}
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-green-950 px-4 lg:hidden">
          <Link href="/">
            <Logo className="h-8 w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg text-white"
          >
            {Icons.menu}
          </button>
        </header>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <button type="button" aria-label="Close menu" className="absolute inset-0 cursor-pointer bg-black/40" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-[280px] animate-fade-up flex-col bg-green-950 px-5 py-5">
              <div className="mb-6 flex items-center justify-between">
                <Logo className="h-8 w-auto" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg text-white"
                >
                  {Icons.close}
                </button>
              </div>
              {nav}
            </div>
          </div>
        )}
        <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
