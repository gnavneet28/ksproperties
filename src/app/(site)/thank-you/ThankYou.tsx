"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { content, getProject, type Project } from "@/content";
import { PhoneLink, WhatsAppLink } from "@/components/ContactLinks";
import { CheckIcon, PhoneIcon, WhatsAppIcon } from "@/components/Icons";
import { safeGet } from "@/lib/attribution";
import { trackLead } from "@/lib/tracking";

export function ThankYou() {
  const [firstName, setFirstName] = useState("");
  const [project, setProject] = useState<Project | undefined>();
  const t = content.thankYou;

  useEffect(() => {
    const raw = safeGet(sessionStorage, "ag_lead");
    if (!raw) return;
    try {
      const lead = JSON.parse(raw) as { firstName?: string; eventId?: string; project?: string; fired?: boolean };
      const p = lead.project ? getProject(lead.project) : undefined;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is only readable after mount
      setFirstName(lead.firstName ?? "");
      setProject(p);
      if (lead.eventId && !lead.fired) {
        trackLead(lead.eventId, p?.name);
        sessionStorage.setItem("ag_lead", JSON.stringify({ ...lead, fired: true }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <section className="on-light mx-auto max-w-[640px] px-4 py-16 text-center md:py-24">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-green-700/30 text-green-700">
        <CheckIcon width={28} height={28} />
      </span>
      <h1 className="mt-7 text-[40px] leading-tight text-green-900 md:text-[56px]">{t.heading(firstName)}</h1>
      <p className="mt-3 text-lg text-muted">{t.text(project?.name ?? "")}</p>
      {project && (
        <p className="mx-auto mt-8 max-w-md rounded-full border border-gold-400/60 bg-gold-100 px-5 py-3 text-[15px] text-ink">
          {t.eoiReminder(project.offer.eoi)}
        </p>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {[content.phones.primary, content.phones.secondary].map((p) => (
          <PhoneLink
            key={p.e164}
            phone={p}
            className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-green-900 px-5 font-medium text-white transition-colors duration-200 hover:bg-green-700"
          >
            <PhoneIcon width={18} height={18} />
            {p.display}
          </PhoneLink>
        ))}
        <WhatsAppLink
          message={project?.whatsapp.thankYou ?? content.whatsapp.message}
          className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-wa px-5 font-medium text-ink transition-opacity duration-200 hover:opacity-90 sm:col-span-2"
        >
          <WhatsAppIcon width={22} height={22} />
          {t.whatsapp}
        </WhatsAppLink>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-8">
        {project && (
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-green-700 underline decoration-green-700/40 underline-offset-4"
          >
            {t.back}
          </Link>
        )}
        <Link
          href="/projects"
          className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-green-700 underline decoration-green-700/40 underline-offset-4"
        >
          {t.allProjects}
        </Link>
      </div>
    </section>
  );
}
