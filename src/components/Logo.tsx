import { content } from "@/content";

/**
 * Placeholder KS Properties wordmark until the official SVG logo is supplied.
 * Replace the <svg> body with the client's file; keep the viewBox ratio close.
 */
export function Logo({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const main = tone === "light" ? "#ffffff" : "#0f3d2a";
  const accent = tone === "light" ? "#e9c46a" : "#1e5b3c";
  const font = { fontFamily: "var(--font-manrope), system-ui, sans-serif", fontWeight: 500 };
  return (
    <svg viewBox="0 0 156 40" className={className} role="img" aria-label={content.brand.name}>
      <rect x="1" y="5" width="30" height="30" rx="7" fill="none" stroke={accent} strokeWidth="1.25" />
      <text x="16" y="25.5" textAnchor="middle" fill={accent} fontSize="13" letterSpacing="0.5" style={font}>
        KS
      </text>
      {/* Baseline set so the wordmark sits centred on the KS badge. */}
      <text x="40" y="26.5" fill={main} fontSize="18" letterSpacing="-0.3" style={font}>
        KS Properties
      </text>
    </svg>
  );
}
