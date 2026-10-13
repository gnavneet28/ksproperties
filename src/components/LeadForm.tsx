"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import { validateField, validateLead, type LeadErrors, type LeadInput } from "@/lib/validation";
import { deviceType, getCookie, readAttribution, safeSet, uuid } from "@/lib/attribution";
import { trackFormStart, trackViewContent } from "@/lib/tracking";
import { queueLead } from "@/lib/leadQueue";
import { PhoneLink, WhatsAppLink } from "./ContactLinks";
import { PhoneIcon, Spinner, WhatsAppIcon } from "./Icons";

const f = content.form.fields;
const initial: LeadInput = { name: "", phone: "", city: "", interest: "", plotSize: "", email: "", consent: false };
const ORDER: (keyof LeadInput)[] = ["name", "phone", "city", "interest", "plotSize", "email", "consent"];

const SELECT_CLS =
  "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%234a5a52%22 stroke-width=%221.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10";

type Status = "idle" | "submitting" | "error" | "rate_limited";

function normalizePhone(raw: string) {
  const v = raw.replace(/[\s()-]/g, "");
  const m = v.match(/^(?:\+?91|0)(\d{10})$/);
  return m ? m[1] : v.slice(0, 10);
}

type FormProject = { slug: string; name: string; builder: string; plotSizeOptions: string[] };

export function LeadForm({ project }: { project: FormProject }) {
  const ctx = { plotSizeOptions: project.plotSizeOptions };
  const router = useRouter();
  const [values, setValues] = useState<LeadInput>(initial);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LeadInput, boolean>>>({});
  const [showEmail, setShowEmail] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const cardRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const started = useRef(false);
  const honeypot = useRef<HTMLInputElement>(null);

  // ViewContent when the form is 50% visible.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackViewContent();
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Hide the WhatsApp FAB while the submit button sits underneath it.
  useEffect(() => {
    const btn = submitRef.current;
    if (!btn) return;
    const BAND = 170;
    let io: IntersectionObserver | null = null;
    const setup = () => {
      io?.disconnect();
      io = new IntersectionObserver(
        ([entry]) => {
          document.documentElement.dataset.fabHide = entry.isIntersecting ? "1" : "";
        },
        { rootMargin: `-${Math.max(window.innerHeight - BAND, 0)}px 0px 0px 0px` },
      );
      io.observe(btn);
    };
    setup();
    window.addEventListener("resize", setup);
    return () => {
      io?.disconnect();
      window.removeEventListener("resize", setup);
      document.documentElement.dataset.fabHide = "";
    };
  }, []);

  function update<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (touched[key] || errors[key]) setErrors((e) => ({ ...e, [key]: validateField(key, value, ctx) }));
  }

  function blur(key: keyof LeadInput) {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((e) => ({ ...e, [key]: validateField(key, values[key] as never, ctx) }));
  }

  function onFirstFocus() {
    if (started.current) return;
    started.current = true;
    trackFormStart();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const errs = validateLead(values, ctx);
    setErrors(errs);
    setTouched(Object.fromEntries(ORDER.map((k) => [k, true])));
    const firstBad = ORDER.find((k) => errs[k]);
    if (firstBad) {
      if (firstBad === "email") setShowEmail(true);
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(`[data-field="${firstBad}"]`);
        el?.focus();
      });
      return;
    }

    setStatus("submitting");
    const eventId = uuid();
    const payload = {
      ...values,
      project: project.slug,
      website: honeypot.current?.value ?? "",
      elapsedMs: Math.round(performance.now()),
      eventId,
      attribution: readAttribution(),
      fbc: getCookie("_fbc"),
      fbp: getCookie("_fbp"),
      device: deviceType(),
      pageUrl: location.href,
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 429) {
        setStatus("rate_limited");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; eventId?: string; errors?: LeadErrors };
      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        setStatus("idle");
        return;
      }
      if (!res.ok || !data.ok) throw new Error(`lead ${res.status}`);

      safeSet(
        sessionStorage,
        "ag_lead",
        JSON.stringify({ firstName: values.name.trim().split(" ")[0], eventId: data.eventId ?? eventId, project: project.slug }),
      );
      router.push(`/thank-you${location.search}`);
    } catch {
      queueLead({ ...payload, retry: true });
      setStatus("error");
    }
  }

  const err = (k: keyof LeadInput) => (touched[k] || status !== "idle" ? errors[k] : undefined);
  const inputCls = (k: keyof LeadInput) =>
    `block w-full min-h-12 rounded-xl border bg-white px-3.5 text-base text-ink placeholder:text-ink/55 outline-none transition-colors duration-200 focus:border-green-700 focus:ring-2 focus:ring-green-700/15 ${
      err(k) ? "border-red-600" : "border-ink/25 hover:border-ink/45"
    }`;

  return (
    <div
      ref={cardRef}
      id="enquire"
      className="on-light relative scroll-mt-[calc(var(--header-h)+12px)] rounded-[20px] border border-line bg-white p-6 text-ink shadow-[0_40px_80px_-30px_rgb(0_0_0/0.55)] sm:p-8 lg:p-7"
    >
      <p className="eyebrow text-green-700">
        {content.form.eyebrow} · {project.name}
      </p>
      <h2 className="mt-2 text-[28px] leading-[1.15] text-green-900 md:text-[32px]">{content.form.heading}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{content.form.subhead}</p>

      <form noValidate onSubmit={onSubmit} onFocus={onFirstFocus} className="mt-6 space-y-5 lg:mt-5 lg:space-y-4">
        {/* Honeypot: hidden from people, tempting to bots. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <Field id="lf-name" label={f.name.label} error={err("name")}>
          <input
            id="lf-name"
            data-field="name"
            type="text"
            name="name"
            autoComplete="name"
            maxLength={60}
            placeholder={f.name.placeholder}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => blur("name")}
            aria-invalid={!!err("name")}
            aria-describedby={err("name") ? "lf-name-err" : undefined}
            className={inputCls("name")}
          />
        </Field>

        <Field id="lf-phone" label={f.phone.label} error={err("phone")}>
          <div className="flex">
            <span className="inline-flex min-h-12 items-center rounded-l-xl border border-r-0 border-ink/25 bg-paper px-3.5 text-[15px] text-muted">
              {f.phone.prefix}
            </span>
            <input
              id="lf-phone"
              data-field="phone"
              type="tel"
              name="phone"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder={f.phone.placeholder}
              value={values.phone}
              onChange={(e) => update("phone", normalizePhone(e.target.value))}
              onBlur={() => blur("phone")}
              aria-invalid={!!err("phone")}
              aria-describedby={err("phone") ? "lf-phone-err" : undefined}
              className={`${inputCls("phone")} rounded-l-none`}
            />
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-3 lg:gap-x-3 lg:gap-y-4">
          <Field id="lf-city" label={f.city.label} error={err("city")}>
            <select
              id="lf-city"
              data-field="city"
              name="city"
              value={values.city}
              onChange={(e) => update("city", e.target.value)}
              onBlur={() => blur("city")}
              aria-invalid={!!err("city")}
              aria-describedby={err("city") ? "lf-city-err" : undefined}
              className={`${inputCls("city")} ${SELECT_CLS} ${
                values.city ? "" : "text-muted"
              }`}
            >
              <option value="" disabled>
                {f.city.placeholder}
              </option>
              {f.city.options.map((o) => (
                <option key={o} value={o} className="text-ink">
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field id="lf-plot" label={f.plotSize.label} error={err("plotSize")}>
            <select
              id="lf-plot"
              data-field="plotSize"
              name="plotSize"
              value={values.plotSize}
              onChange={(e) => update("plotSize", e.target.value)}
              aria-invalid={!!err("plotSize")}
              aria-describedby={err("plotSize") ? "lf-plot-err" : undefined}
              className={`${inputCls("plotSize")} ${SELECT_CLS} ${values.plotSize ? "" : "text-muted"}`}
            >
              <option value="">{f.plotSize.placeholder}</option>
              {project.plotSizeOptions.map((o) => (
                <option key={o} value={o} className="text-ink">
                  {o}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <ChipGroup
          name="interest"
          label={f.interest.label}
          options={f.interest.options}
          value={values.interest}
          error={err("interest")}
          onChange={(o) => update("interest", o)}
        />


        {!showEmail && (
          <button
            type="button"
            onClick={() => setShowEmail(true)}
            className="min-h-11 cursor-pointer text-sm font-medium text-green-700 underline decoration-green-700/40 underline-offset-4"
          >
            {f.email.reveal}
          </button>
        )}
        <div className={showEmail ? "block" : "hidden"}>
          <Field id="lf-email" label={f.email.label} error={err("email")}>
            <input
              id="lf-email"
              data-field="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder={f.email.placeholder}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              onBlur={() => blur("email")}
              aria-invalid={!!err("email")}
              aria-describedby={err("email") ? "lf-email-err" : undefined}
              className={inputCls("email")}
            />
          </Field>
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-muted">
            <input
              type="checkbox"
              name="consent"
              data-field="consent"
              checked={values.consent}
              onChange={(e) => update("consent", e.target.checked)}
              aria-invalid={!!err("consent")}
              aria-describedby={err("consent") ? "lf-consent-err" : undefined}
              className="h-6 w-6 shrink-0 cursor-pointer accent-green-700"
            />
            <span>
              {f.consent.before(project.builder)}
              <a href="/privacy-policy" target="_blank" rel="noopener" className="text-green-700 underline decoration-green-700/40 underline-offset-2">
                {f.consent.link}
              </a>
              {f.consent.after}
            </span>
          </label>
          {err("consent") && <ErrorText id="lf-consent-err">{err("consent")}</ErrorText>}
        </div>

        <button
          ref={submitRef}
          type="submit"
          disabled={status === "submitting"}
          className="flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 text-base font-medium tracking-wide text-ink transition-colors duration-200 hover:bg-gold-300 disabled:cursor-wait disabled:opacity-80"
        >
          {status === "submitting" ? (
            <>
              <Spinner />
              {content.form.submitting}
            </>
          ) : (
            content.form.submit
          )}
        </button>

        {(status === "error" || status === "rate_limited") && (
          <div role="alert" className="rounded-xl border border-red-600/30 bg-red-600/5 p-4 text-sm">
            <p className="font-medium text-red-600">
              {status === "error" ? content.form.errors.failure : content.form.errors.rateLimited}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <PhoneLink
                phone={content.phones.primary}
                className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-green-900 font-medium text-white"
              >
                <PhoneIcon width={16} height={16} />
                {content.mobileBar.call}
              </PhoneLink>
              <WhatsAppLink className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-wa font-medium text-ink">
                <WhatsAppIcon width={18} height={18} />
                {content.thankYou.whatsapp}
              </WhatsAppLink>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted">{content.form.privacyNote}</p>
      </form>
    </div>
  );
}

function ChipGroup({
  name,
  label,
  options,
  value,
  error,
  onChange,
}: {
  name: string;
  label: string;
  options: string[];
  value: string;
  error?: string;
  onChange: (option: string) => void;
}) {
  const errId = `lf-${name}-err`;
  return (
    <fieldset aria-describedby={error ? errId : undefined}>
      <legend className="mb-2 text-sm font-medium text-ink/85">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => {
          const checked = value === o;
          return (
            <label
              key={o}
              className={`relative inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-green-700 ${
                checked
                  ? "border-green-900 bg-green-900 text-white"
                  : error
                    ? "border-red-600 bg-white"
                    : "border-ink/25 bg-white text-ink/85 hover:border-green-700"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o}
                data-field={i === 0 ? name : undefined}
                checked={checked}
                onChange={() => onChange(o)}
                className="sr-only"
              />
              {o}
            </label>
          );
        })}
      </div>
      {error && <ErrorText id={errId}>{error}</ErrorText>}
    </fieldset>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink/85">
        {label}
      </label>
      {children}
      {error && <ErrorText id={`${id}-err`}>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-[13px] text-red-600">
      {children}
    </p>
  );
}
