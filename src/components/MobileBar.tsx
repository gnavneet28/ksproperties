import { content } from "@/content";
import { PhoneLink, WhatsAppLink } from "./ContactLinks";
import { PhoneIcon, WhatsAppIcon } from "./Icons";

/** Mobile-only sticky bottom bar: Call | WhatsApp (message follows the project on screen). */
export function MobileBar() {
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2.5 border-t border-white/10 bg-green-950 px-4 pt-2.5 md:hidden"
      style={{ paddingBottom: "calc(10px + var(--safe-b))", height: "calc(var(--bar-h) + var(--safe-b))" }}
    >
      <PhoneLink
        phone={content.phones.primary}
        className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/30 text-[15px] font-medium text-white"
      >
        <PhoneIcon width={16} height={16} />
        {content.mobileBar.call}
      </PhoneLink>
      <WhatsAppLink placement="bottomBar" className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold-500 text-[15px] font-medium text-ink">
        <WhatsAppIcon width={18} height={18} />
        {content.mobileBar.whatsapp}
      </WhatsAppLink>
    </nav>
  );
}
