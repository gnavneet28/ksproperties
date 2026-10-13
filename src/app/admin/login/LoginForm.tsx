"use client";

import { useActionState, useEffect } from "react";
import { login } from "../actions";
import { btn, field, label } from "@/components/admin/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  // Full navigation so the new session cookie is used and the proxy rewrite applies.
  useEffect(() => {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload on session change
    if (state?.ok) window.location.assign("/");
  }, [state]);
  return (
    <form action={action} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className={label}>
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={`${field} min-h-11`} />
      </div>
      <div>
        <label htmlFor="password" className={label}>
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={`${field} min-h-11`} />
      </div>
      {state && !state.ok && (
        <p role="alert" className="rounded-lg border border-red-600/25 bg-red-600/5 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${btn.primary} min-h-11 w-full`}>
        {pending || state?.ok ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
