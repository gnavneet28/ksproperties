import Image from "next/image";
import Link from "next/link";
import { content, plotWhatsappMessage, type Project } from "@/content";
import { HeroArt } from "./HeroArt";
import { LazyMap } from "./LazyMap";
import { PhoneLink, WhatsAppLink } from "./ContactLinks";
import { ArrowRightIcon, CheckIcon, PhoneIcon, PinIcon, WhatsAppIcon, featureIcons } from "./Icons";
import { SITE_URL } from "@/lib/site";

function SectionHead({ id, eyebrow, title, dark = false, center = false }: { id: string; eyebrow: string; title: string; dark?: boolean; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <p className={`eyebrow ${dark ? "text-gold-400" : "text-green-700"}`}>{eyebrow}</p>
      <h2 id={id} className={`mt-2.5 text-[24px] leading-[1.18] sm:mt-3 sm:text-[30px] sm:leading-[1.15] md:text-[42px] ${dark ? "text-white" : "text-green-900"}`}>
        {title}
      </h2>
    </div>
  );
}

export function ProjectLanding({ project, showBreadcrumb = false }: { project: Project; showBreadcrumb?: boolean }) {
  const { hero, highlights, lifestyle, pricing, locationSection, gallery, faq, closing, offer, images } = project;
  const { phones } = content;
  const url = `${SITE_URL}/projects/${project.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#org`,
        name: content.brand.name,
        url: SITE_URL,
        telephone: [phones.primary.e164, phones.secondary.e164],
      },
      {
        "@type": "RealEstateListing",
        name: `${project.name} by ${project.builder}`,
        description: project.seo.description,
        url,
        image: images.gallery.map((i) => `${SITE_URL}${i.src}`),
        provider: { "@id": `${SITE_URL}/#org` },
        about: {
          "@type": "Place",
          name: project.name,
          address: {
            "@type": "PostalAddress",
            streetAddress: project.location.address,
            addressLocality: project.location.city,
            addressRegion: project.location.state,
            addressCountry: "IN",
          },
          hasMap: project.location.mapUrl,
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "INR",
          lowPrice: offer.priceNumeric,
          offerCount: project.plots.length,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero
          Mobile (<640px): edge-to-edge photo, then a rounded content sheet with a key-facts strip
          and one primary CTA. Tablet/desktop: text column, plus the photo on the right from lg. */}
      <section className="relative isolate text-white">
        <HeroArt />

        {/* Mobile photo */}
        <figure className="relative aspect-[5/4] w-full overflow-hidden sm:hidden">
          <Image
            src={images.feature.src}
            alt={images.feature.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_8%]"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-green-950/40" />
          <p className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70 motion-reduce:hidden" />
              <span className="relative inline-flex h-full w-full rounded-full bg-red-500" />
            </span>
            {project.status.label} · {project.status.detail}
          </p>
          <figcaption className="absolute bottom-9 left-4 text-[11px] text-white/80 [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]">{hero.imageCaption}</figcaption>
        </figure>

        <div className="mx-auto grid max-w-[1200px] items-center sm:gap-8 sm:px-4 sm:pb-12 sm:pt-8 md:gap-10 md:px-6 md:pt-14 lg:grid-cols-[1fr_340px] lg:gap-10 lg:py-16 xl:grid-cols-[1fr_400px] xl:gap-16">
          <div className="relative z-10 -mt-6 rounded-t-[28px] bg-green-950 px-5 pb-7 pt-6 sm:mt-0 sm:rounded-none sm:bg-transparent sm:p-0">
            {showBreadcrumb && (
              <nav aria-label="Breadcrumb" className="-mt-2 mb-2 sm:mb-5 sm:mt-0">
                <Link
                  href="/projects"
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-white/70 transition-colors duration-200 hover:text-gold-300"
                >
                  <ArrowRightIcon width={14} height={14} className="rotate-180" />
                  {content.projectsPage.backToProjects}
                </Link>
              </nav>
            )}

            {/* Overline: project + builder on mobile (status lives on the photo); status + project from sm */}
            <p className="eyebrow text-[11px] text-gold-400 sm:hidden">{hero.eyebrow}</p>
            <p className="eyebrow hidden items-start gap-2.5 leading-relaxed text-gold-100 sm:flex">
              <span className="relative mt-[0.45em] flex h-2 w-2 shrink-0" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-full w-full rounded-full bg-red-600" />
              </span>
              <span>
                {project.status.label} · {hero.eyebrow}
              </span>
            </p>

            <h1 className="mt-2.5 text-[28px] leading-[1.15] tracking-[-0.02em] sm:mt-5 sm:text-[40px] sm:leading-[1.08] md:text-[54px] lg:text-[56px] xl:text-[60px]">
              {hero.h1Lead} <span className="text-gold-400">{hero.h1Accent}</span>
            </h1>
            <p className="mt-2.5 flex items-start gap-1.5 text-[13px] leading-snug text-white/70 sm:mt-4 sm:inline-flex sm:gap-2 sm:text-[15px] sm:text-gold-100">
              <PinIcon width={15} height={15} className="mt-px shrink-0 text-gold-400" />
              {project.location.address}
            </p>

            {/* Mobile: key facts strip */}
            <dl className="mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/12 bg-white/[0.04] sm:hidden">
              {hero.facts.map((f) => (
                <div key={f.label} className="flex flex-col-reverse items-center gap-1.5 px-1 py-3.5 text-center">
                  <dt className="text-[11px] uppercase tracking-[0.08em] text-white/55">{f.label}</dt>
                  <dd className={`whitespace-nowrap text-[17px] font-medium leading-none tracking-tight ${f.highlight ? "text-gold-400" : "text-white"}`}>
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Tablet/desktop: size note, big price and EOI badge */}
            <p className="mt-1.5 hidden text-[15px] text-white/70 sm:block">{hero.sizeNote}</p>
            <div className="mt-6 hidden max-w-xl flex-wrap items-end gap-x-8 gap-y-4 border-t border-white/15 pt-6 sm:flex md:mt-8 md:pt-7">
              <div>
                <p className="eyebrow text-white/60">{hero.pricePrefix}</p>
                <p className="mt-2 whitespace-nowrap text-[46px] font-medium leading-none tracking-tight text-gold-500 md:text-[60px]">{hero.price}</p>
              </div>
              <p className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-gold-400/50 bg-gold-500/10 px-4 py-2.5 text-[15px] text-gold-100">
                <CheckIcon width={16} height={16} className="text-gold-400" />
                {hero.eoiBadge}
              </p>
            </div>

            <div className="mt-5 flex flex-col sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-3 md:mt-8">
              <WhatsAppLink
                message={project.whatsapp.hero}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-gold-500 px-5 text-[15px] font-medium text-ink shadow-[0_10px_24px_-12px_rgb(245_197_24/0.8)] transition-colors duration-200 hover:bg-gold-300 sm:min-h-[52px] sm:gap-2.5 sm:rounded-xl sm:px-7 sm:text-base sm:shadow-none"
              >
                <WhatsAppIcon width={19} height={19} className="shrink-0" />
                {hero.primaryCta}
              </WhatsAppLink>
              {/* Mobile: quiet call link (the sticky bottom bar also has Call) */}
              <p className="mt-1 text-center text-[13px] text-white/60 sm:hidden">
                {hero.orCall}{" "}
                <PhoneLink
                  phone={phones.primary}
                  className="inline-flex min-h-11 cursor-pointer items-center font-medium text-white underline decoration-white/30 underline-offset-4"
                >
                  {phones.primary.display}
                </PhoneLink>
              </p>
              <PhoneLink
                phone={phones.primary}
                className="hidden min-h-[52px] cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded-xl border border-white/40 px-7 text-base font-medium text-white transition-colors duration-200 hover:border-white hover:bg-white/10 sm:inline-flex"
              >
                <PhoneIcon width={18} height={18} />
                {hero.secondaryCta}
                <span className="text-white/75">{phones.primary.display}</span>
              </PhoneLink>
            </div>

            <p className="text-center text-[11px] leading-relaxed text-white/45 sm:mt-5 sm:text-left sm:text-xs sm:text-white/55">
              {offer.priceFootnote}
            </p>
          </div>
          <figure className="relative hidden lg:block">
            <Image
              src={images.feature.src}
              alt={images.feature.alt}
              width={images.feature.width}
              height={images.feature.height}
              priority
              sizes="(min-width: 1280px) 400px, 340px"
              className="h-auto w-full rounded-[24px] object-cover shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)] ring-1 ring-white/10"
            />
            <figcaption className="eyebrow absolute bottom-3 left-3 rounded-full bg-green-950/75 px-3 py-1.5 text-[10px] text-white backdrop-blur">
              {hero.imageCaption}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Highlights */}
      <section className="on-light py-16 md:py-24" aria-labelledby="highlights-h">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <SectionHead id="highlights-h" eyebrow={highlights.eyebrow} title={highlights.heading} />
          <ul className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {highlights.items.map((h, i) => {
              const Icon = featureIcons[h.icon];
              return (
                <li key={h.title} className="flex gap-4 bg-white p-6 sm:flex-col sm:gap-0 md:p-8">
                  <div className="flex items-center justify-between sm:mb-8">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-green-700/30 text-green-700">
                      <Icon width={22} height={22} />
                    </span>
                    <span className="hidden text-sm text-muted sm:block">0{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-[20px] leading-snug text-green-900 md:text-[22px]">{h.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{h.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Plot sizes & prices */}
      <section className="bg-green-900 py-16 text-white md:py-24" aria-labelledby="pricing-h">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <SectionHead id="pricing-h" eyebrow={pricing.eyebrow} title={pricing.heading} dark center />
          <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
            {project.plots.map((plot) => (
              <li key={plot.size} className="flex flex-col rounded-[20px] border border-gold-400/30 bg-green-950/50 p-6 text-center sm:p-4 md:p-5 lg:p-7">
                <p className="eyebrow text-gold-100">{plot.size}</p>
                <p className="mt-6 text-sm text-white/60">{pricing.startingAt}</p>
                <p className="mt-1 whitespace-nowrap text-[34px] font-medium leading-none tracking-tight text-gold-400 sm:text-[24px] md:text-[26px] lg:text-[32px]">
                  {plot.price}*
                </p>
                <WhatsAppLink
                  message={plotWhatsappMessage(project, plot)}
                  className="mt-7 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/25 px-4 text-[15px] font-medium text-white transition-colors duration-200 hover:border-gold-400 hover:bg-white/5 hover:text-gold-300"
                >
                  <WhatsAppIcon width={18} height={18} />
                  {pricing.cta}
                </WhatsAppLink>
              </li>
            ))}
          </ul>
          <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-px border-y border-gold-400/25 bg-gold-400/25 lg:grid-cols-4">
            {pricing.stats.map((s) => (
              <li key={s.label} className="bg-green-900 px-3 py-6 text-center">
                <p className="whitespace-nowrap text-[26px] font-medium leading-none tracking-tight text-white md:text-[30px]">{s.value}</p>
                <p className="eyebrow mt-3 text-[10px] text-white/60">{s.label}</p>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-white/60">{pricing.note}</p>
        </div>
      </section>

      {/* Lifestyle / why this project */}
      <section className="on-light bg-white py-16 md:py-24" aria-labelledby="lifestyle-h">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 md:px-6 lg:grid-cols-[minmax(0,480px)_1fr] lg:gap-x-16 lg:gap-y-8">
          <figure className="relative mx-auto w-full max-w-[480px] lg:col-start-1 lg:row-start-1 lg:self-start">
            <Image
              src={images.lifestyle.src}
              alt={images.lifestyle.alt}
              width={images.lifestyle.width}
              height={images.lifestyle.height}
              sizes="(min-width: 520px) 480px, 100vw"
              className="h-auto w-full rounded-[20px] object-cover"
            />
            <figcaption className="eyebrow absolute bottom-3 left-3 rounded-full bg-green-950/75 px-3 py-1.5 text-[10px] text-white backdrop-blur">
              {lifestyle.imageCaption}
            </figcaption>
          </figure>
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <SectionHead id="lifestyle-h" eyebrow={lifestyle.eyebrow} title={lifestyle.heading} />
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted">{lifestyle.intro}</p>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {lifestyle.why.map((w) => (
                <li key={w} className="flex gap-3.5 py-3.5 text-[16px] text-ink/90">
                  <CheckIcon width={18} height={18} className="mt-1 shrink-0 text-green-700" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
          {/* Under the photo on desktop to balance the columns; after the list on mobile. */}
          <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
            <p className="eyebrow text-green-700">{lifestyle.amenitiesHeading}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {lifestyle.amenities.map((a) => (
                <li key={a} className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm text-ink/85">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="on-light py-16 md:py-24" aria-labelledby="location-h">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:items-start lg:gap-16">
            <div>
              <SectionHead id="location-h" eyebrow={locationSection.eyebrow} title={locationSection.heading} />
              <p className="mt-4 max-w-md text-[17px] leading-relaxed text-muted">{locationSection.subhead}</p>

              <p className="eyebrow mt-8 text-green-700">{locationSection.connectivityHeading}</p>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {locationSection.connectivity.map((c) => {
                  const Icon = featureIcons[c.icon];
                  return (
                    <li key={c.title} className="flex items-center gap-3.5 py-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-green-700/30 bg-white text-green-700">
                        <Icon width={17} height={17} />
                      </span>
                      <span className="text-[16px] text-ink/90">{c.title}</span>
                    </li>
                  );
                })}
              </ul>

              {locationSection.infra.length > 0 && (
                <>
                  <p className="eyebrow mt-8 text-green-700">{locationSection.infraHeading}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {locationSection.infra.map((i) => (
                      <li key={i} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink/85">
                        {i}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div>
              <LazyMap query={project.location.mapQuery} title={locationSection.mapTitle} placeholder={locationSection.mapPlaceholder} />
              <a
                href={project.location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-12 cursor-pointer items-center gap-2 border-b border-green-700/40 text-base font-medium text-green-700 transition-colors duration-200 hover:border-green-700"
              >
                <PinIcon width={16} height={16} />
                {locationSection.openInMaps}
                <ArrowRightIcon width={16} height={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {images.gallery.length > 0 && (
        <section className="on-light bg-white py-16 md:py-24" aria-labelledby="gallery-h">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <SectionHead id="gallery-h" eyebrow={gallery.eyebrow} title={gallery.heading} />
            <ul className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:scroll-px-0 md:px-0">
              {images.gallery.map((img) => (
                <li key={img.src} className="relative max-w-[86vw] shrink-0 snap-start md:max-w-none">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    loading="lazy"
                    sizes="520px"
                    className="h-52 w-auto max-w-full rounded-[20px] object-cover sm:h-56 md:h-64"
                  />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">{lifestyle.imageCaption}</p>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="on-light faq py-16 md:py-24" aria-labelledby="faq-h">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 md:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:self-start">
            <SectionHead id="faq-h" eyebrow={faq.eyebrow} title={faq.heading} />
            <p className="mt-4 text-[15px] text-muted">
              {closing.orCall}{" "}
              <PhoneLink phone={phones.primary} className="cursor-pointer text-green-700 underline decoration-green-700/40 underline-offset-4">
                {phones.primary.display}
              </PhoneLink>
            </p>
          </div>
          <div className="border-t border-line">
            {faq.items.map((item) => (
              <details key={item.q} className="group border-b border-line">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] text-ink transition-colors duration-200 hover:text-green-700 md:text-lg">
                  {item.q}
                  <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/20 text-green-700" aria-hidden>
                    <span className="absolute h-px w-3.5 bg-current" />
                    <span className="faq-plus-v absolute h-3.5 w-px bg-current transition-transform duration-200" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 pr-12 text-[16px] leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative isolate overflow-hidden bg-green-950 py-20 text-center text-white md:py-28">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative static SVG */}
        <img
          src="/hero-masterplan.svg"
          alt=""
          loading="lazy"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-[900px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.12]"
        />
        <div className="mx-auto max-w-[760px] px-4 md:px-6">
          <p className="eyebrow text-gold-400">{closing.eyebrow}</p>
          <h2 className="mt-3 text-[27px] leading-[1.12] sm:mt-4 sm:text-[34px] sm:leading-[1.1] md:text-[52px]">{closing.heading}</h2>
          <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-white/75">{closing.text}</p>
          <WhatsAppLink
            message={project.whatsapp.eoi}
            className="mt-9 inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-gold-500 px-5 text-[15px] font-medium text-ink transition-colors duration-200 hover:bg-gold-300 sm:w-auto sm:px-9 sm:text-base"
          >
            <WhatsAppIcon width={20} height={20} />
            {closing.cta}
          </WhatsAppLink>
          <p className="eyebrow mt-10 text-white/50">{closing.orCall}</p>
          <div className="mt-3 flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-10">
            {[phones.primary, phones.secondary].map((p) => (
              <PhoneLink
                key={p.e164}
                phone={p}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-xl text-gold-100 transition-colors duration-200 hover:text-gold-400"
              >
                <PhoneIcon width={16} height={16} />
                {p.display}
              </PhoneLink>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
