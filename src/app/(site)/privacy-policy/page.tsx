import type { Metadata } from "next";
import { builders, content, privacySections } from "@/content";

export const metadata: Metadata = {
  title: content.seo.privacyTitle,
  description: content.seo.privacyDescription,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicy() {
  const { privacy } = content;
  const sections = privacySections(builders());
  return (
    <article className="on-light mx-auto max-w-[720px] px-4 py-14 md:py-20">
      <p className="eyebrow text-green-700">{content.brand.name}</p>
      <h1 className="mt-3 text-[34px] leading-tight text-green-900 sm:text-[40px] md:text-[52px]">{privacy.heading}</h1>
      <p className="mt-3 text-sm text-muted">
        {privacy.lastUpdatedLabel}: <time>{privacy.lastUpdated}</time>
      </p>

      <section aria-labelledby="summary-h" className="mt-8 rounded-[20px] border border-green-700/20 bg-green-700/[0.05] p-6">
        <h2 id="summary-h" className="eyebrow text-green-700">
          {privacy.summaryHeading}
        </h2>
        <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-ink/85">
          {privacy.summary.map((line) => (
            <li key={line} className="flex gap-3">
              <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-700" />
              {line}
            </li>
          ))}
        </ul>
      </section>

      <nav aria-labelledby="toc-h" className="mt-6 rounded-[20px] border border-line bg-white p-6">
        <h2 id="toc-h" className="eyebrow text-green-700">
          {privacy.tocHeading}
        </h2>
        <ol className="mt-4 space-y-2 text-[15px]">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="cursor-pointer text-ink/85 underline-offset-4 transition-colors duration-200 hover:text-green-700 hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-12 space-y-12 text-[16px] leading-relaxed text-ink/85">
        {sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
            <h2 id={`${s.id}-h`} className="text-[24px] leading-snug text-green-900 md:text-[28px]">
              {s.title}
            </h2>
            {s.body?.map((p) => (
              <p key={p} className="mt-3">
                {p}
              </p>
            ))}
            {s.groups?.map((g) => (
              <div key={g.heading} className="mt-5">
                <h3 className="text-[17px] font-medium text-green-900">{g.heading}</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5">
                  {g.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              </div>
            ))}
            {s.list && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                {s.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            )}
            {s.after?.map((p) => (
              <p key={p} className="mt-3">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
