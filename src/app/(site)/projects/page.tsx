import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { content, projects } from "@/content";
import { PhoneLink } from "@/components/ContactLinks";
import { ArrowRightIcon, PhoneIcon, PinIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: content.seo.projectsTitle,
  description: content.seo.projectsDescription,
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  const t = content.projectsPage;
  return (
    <>
      <section className="relative isolate overflow-hidden bg-green-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(100%_90%_at_85%_0%,#1e5b3c_0%,transparent_60%)]" />
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative static SVG */}
        <img
          src="/hero-masterplan.svg"
          alt=""
          className="pointer-events-none absolute -right-32 -top-10 -z-10 w-[640px] max-w-none rotate-[-8deg] opacity-25 md:w-[760px]"
        />
        <div className="mx-auto max-w-[1200px] px-4 py-14 md:px-6 md:py-20">
          <p className="eyebrow text-gold-400">{t.eyebrow}</p>
          <h1 className="mt-4 text-[40px] leading-[1.08] md:text-[56px]">{t.heading}</h1>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/75">{t.intro}</p>
        </div>
      </section>

      <section className="on-light py-12 md:py-20" aria-label={t.heading}>
        <ul className="mx-auto grid max-w-[1200px] gap-6 px-4 md:grid-cols-2 md:px-6 lg:grid-cols-3">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/projects/${p.slug}`}
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[20px] border border-line bg-white transition-shadow duration-200 hover:shadow-[0_24px_48px_-24px_rgb(10_43_30/0.35)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-green-900">
                  <Image
                    src={p.images.card.src}
                    alt={p.images.card.alt}
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="eyebrow absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-green-950/80 px-3 py-1.5 text-[10px] text-white backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600" aria-hidden />
                    {p.status.label}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-sm text-muted">
                    {t.by} {p.builder}
                  </p>
                  <h2 className="mt-1 text-[26px] leading-tight text-green-900">{p.name}</h2>
                  <p className="mt-2 flex items-start gap-1.5 text-[15px] text-ink/80">
                    <PinIcon width={16} height={16} className="mt-0.5 shrink-0 text-green-700" />
                    {p.location.address}
                  </p>
                  <p className="mt-1 text-sm text-muted">{p.status.detail}</p>

                  <dl className="mt-5 divide-y divide-line rounded-xl border border-line bg-paper px-4 text-[15px]">
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-muted">{t.launch}</dt>
                      <dd className="whitespace-nowrap text-muted line-through decoration-red-500/70">{p.offer.launchPrice}</dd>
                    </div>
                    {[
                      [t.from, `${p.offer.price}*`],
                      [t.plots, `${p.plots.map((pl) => pl.sizeShort).join(" · ")} sq. yd`],
                      [t.eoi, p.offer.eoi],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                        <dt className="text-muted">{label}</dt>
                        <dd className="whitespace-nowrap font-medium text-green-900">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <span className="mt-6 inline-flex min-h-11 items-center gap-2 self-start border-b border-green-700/40 text-[15px] font-medium text-green-700 transition-colors duration-200 group-hover:border-green-700">
                    {t.view}
                    <ArrowRightIcon width={16} height={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                  <p className="mt-4 text-xs text-muted">{p.offer.priceFootnote}</p>
                </div>
              </Link>
            </li>
          ))}

          <li className="flex flex-col justify-center rounded-[20px] border border-dashed border-ink/20 p-8 text-center">
            <h2 className="text-[22px] text-green-900">{t.comingSoon.title}</h2>
            <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-muted">{t.comingSoon.text}</p>
            <PhoneLink
              phone={content.phones.primary}
              className="mx-auto mt-6 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-green-900 px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-green-700"
            >
              <PhoneIcon width={16} height={16} />
              {content.phones.primary.display}
            </PhoneLink>
          </li>
        </ul>
      </section>
    </>
  );
}
