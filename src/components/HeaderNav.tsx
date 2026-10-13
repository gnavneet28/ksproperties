"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

/** Primary links: full-white text, visible hover pill, gold underline on the current page. */
export function HeaderNav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav aria-label="Main">
      <ul className="flex items-center gap-1">
        {items.map((item, i) => {
          const active = isActive(item.href);
          return (
            // "Home" is redundant with the logo on phones, so only later links show there.
            <li key={item.href} className={i === 0 ? "hidden sm:block" : undefined}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 text-[15px] font-medium transition-colors duration-200 focus-visible:outline-white ${
                  active
                    ? "bg-white/12 text-white"
                    : "text-white hover:bg-white/10 sm:border-transparent max-sm:border max-sm:border-white/30"
                }`}
              >
                {item.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-4 bottom-1.5 h-0.5 rounded-full bg-gold-400 transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
