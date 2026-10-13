import { content } from "@/content";

export type LeadInput = {
  name: string;
  phone: string;
  city: string;
  interest: string;
  plotSize: string;
  email: string;
  consent: boolean;
};

export type LeadErrors = Partial<Record<keyof LeadInput, string>>;

const NAME_RE = /^[A-Za-z. ]{2,60}$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeName(name: string) {
  return name.replace(/\s+/g, " ").trim();
}

export type LeadContext = { plotSizeOptions: string[] };

export function validateField<K extends keyof LeadInput>(
  key: K,
  value: LeadInput[K],
  ctx: LeadContext,
): string | undefined {
  const e = content.form.errors;
  const f = content.form.fields;
  switch (key) {
    case "name": {
      const v = normalizeName(String(value));
      return NAME_RE.test(v) && /[A-Za-z]/.test(v) ? undefined : e.name;
    }
    case "phone":
      return PHONE_RE.test(String(value)) ? undefined : e.phone;
    case "city":
      return f.city.options.includes(String(value)) ? undefined : e.city;
    case "interest":
      return f.interest.options.includes(String(value)) ? undefined : e.interest;
    case "plotSize":
      return value === "" || ctx.plotSizeOptions.includes(String(value)) ? undefined : e.plotSize;
    case "email": {
      const v = String(value).trim();
      return v === "" || (v.length <= 254 && EMAIL_RE.test(v)) ? undefined : e.email;
    }
    case "consent":
      return value === true ? undefined : e.consent;
  }
  return undefined;
}

export function validateLead(input: LeadInput, ctx: LeadContext): LeadErrors {
  const errors: LeadErrors = {};
  (Object.keys(input) as (keyof LeadInput)[]).forEach((k) => {
    const err = validateField(k, input[k] as never, ctx);
    if (err) errors[k] = err;
  });
  return errors;
}
