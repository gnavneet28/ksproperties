import Link from "next/link";
import { builders, content } from "@/content";
import { Logo } from "./Logo";
import { PhoneLink } from "./ContactLinks";

async function currentYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await currentYear();
  const { footer, phones } = content;
  const linkCls =
    "inline-flex min-h-11 cursor-pointer items-center underline decoration-white/30 underline-offset-4 transition-colors duration-200 hover:text-gold-300";
  return (
    <footer className="bg-green-950 text-white/75">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-6 md:py-16">
        <div className="text-sm">
          <Logo className="h-10 w-auto" />
          <p className="mt-4 max-w-xs leading-relaxed">{footer.about(builders().join(", "))}</p>
        </div>
        <div className="text-sm">
          <p className="eyebrow text-gold-400">{footer.exploreHeading}</p>
          <ul className="mt-2">
            <li>
              <Link href="/projects" className={linkCls}>
                {footer.projectsLink}
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className={linkCls}>
                {footer.privacyLink}
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="eyebrow text-gold-400">{footer.contactHeading}</p>
          <ul className="mt-2">
            {[phones.primary, phones.secondary].map((p) => (
              <li key={p.e164}>
                <PhoneLink
                  phone={p}
                  className="inline-flex min-h-11 cursor-pointer items-center text-lg text-white transition-colors duration-200 hover:text-gold-300"
                >
                  {p.display}
                </PhoneLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1200px] space-y-2 px-4 py-6 text-xs leading-relaxed text-white/60 md:px-6">
          <p>{footer.disclaimer}</p>
          <p>{footer.copyright(year)}</p>
        </div>
      </div>
    </footer>
  );
}
