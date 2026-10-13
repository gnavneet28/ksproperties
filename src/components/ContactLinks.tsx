"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { content, projectForPath, telHref, whatsappHref } from "@/content";

type Phone = { display: string; e164: string };

/**
 * tel: link. On devices without a touch screen most browsers
 * can't dial, so the number is copied to the clipboard instead.
 */
export function PhoneLink({
  phone,
  className,
  children,
  ariaLabel,
}: {
  phone: Phone;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <a
      href={telHref(phone)}
      className={`relative ${className ?? ""}`}
      aria-label={ariaLabel}
      onClick={(e) => {
        const canDial = window.matchMedia("(pointer: coarse)").matches;
        if (!canDial && navigator.clipboard) {
          e.preventDefault();
          navigator.clipboard.writeText(phone.display).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          });
        }
      }}
    >
      {children}
      <span
        role="status"
        className={`pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white transition-opacity ${
          copied ? "opacity-100" : "opacity-0"
        }`}
      >
        {copied ? content.phoneUi.copied : ""}
      </span>
    </a>
  );
}

export function WhatsAppLink({
  className,
  children,
  ariaLabel,
  message,
  placement,
}: {
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  /** Pre-typed message. If omitted, the project on this page supplies one for `placement`. */
  message?: string;
  placement?: "bottomBar" | "floating";
}) {
  const pathname = usePathname();
  const project = projectForPath(pathname);
  const text = message ?? (project ? project.whatsapp[placement ?? "bottomBar"] : content.whatsapp.message);
  return (
    <a
      href={whatsappHref(text)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
