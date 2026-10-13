import Link from "next/link";
import { content } from "@/content";
import { Logo } from "./Logo";
import { PhoneLink } from "./ContactLinks";
import { PhoneIcon } from "./Icons";
import { HeaderNav } from "./HeaderNav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 h-[var(--header-h)] border-b border-white/10 bg-green-950 shadow-[0_1px_0_rgb(0_0_0/0.15)]">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <Link href="/" aria-label={`${content.brand.name} home`} className="flex min-h-11 shrink-0 cursor-pointer items-center rounded-lg">
          <Logo className="h-9 w-auto md:h-10" />
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <HeaderNav items={content.header.nav} />

          <PhoneLink
            phone={content.phones.primary}
            className="hidden min-h-11 cursor-pointer items-center gap-2.5 rounded-full bg-gold-500 px-5 text-[15px] font-medium text-ink shadow-[0_6px_18px_-8px_rgb(245_197_24/0.7)] transition-colors duration-200 hover:bg-gold-300 focus-visible:outline-white md:inline-flex"
          >
            <PhoneIcon width={16} height={16} />
            <span>{content.header.callNow}</span>
            <span aria-hidden className="hidden h-4 w-px bg-ink/25 lg:block" />
            <span className="hidden tabular-nums lg:inline">{content.phones.primary.display}</span>
          </PhoneLink>
        </div>
      </div>
    </header>
  );
}
