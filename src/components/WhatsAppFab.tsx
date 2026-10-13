import { content } from "@/content";
import { WhatsAppLink } from "./ContactLinks";
import { WhatsAppIcon } from "./Icons";

/** Floating WhatsApp button for tablet/desktop; phones use the WhatsApp button in the bottom bar. */
export function WhatsAppFab() {
  return (
    <div className="wa-fab group fixed bottom-4 right-4 z-50 hidden items-center gap-2 transition-all duration-200 md:flex">
      <span
        aria-hidden
        className="pointer-events-none translate-x-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
      >
        {content.whatsapp.hoverLabel}
      </span>
      <WhatsAppLink
        placement="floating"
        ariaLabel={content.whatsapp.ariaLabel}
        className="grid h-14 w-14 shrink-0 cursor-pointer place-items-center rounded-full bg-wa text-white shadow-[0_6px_20px_rgb(0_0_0/0.25)] animate-pulse-once transition-shadow duration-200 hover:shadow-[0_8px_28px_rgb(0_0_0/0.35)] focus-visible:outline-white"
      >
        <WhatsAppIcon width={30} height={30} />
      </WhatsAppLink>
    </div>
  );
}
