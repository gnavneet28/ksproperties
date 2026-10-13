/**
 * Masterplan line drawing (public/hero-masterplan.svg) on deep green.
 * Swap for an optimised site photo (next/image, priority, blur placeholder) once the
 * client supplies artwork — keep the dark overlay for legibility.
 */
/** Decorative background art (alt="" so screen readers skip it). */
export function HeroArt() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-green-950">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_85%_10%,#1e5b3c_0%,transparent_60%)]" />
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimisation needed */}
      <img
        src="/hero-masterplan.svg"
        alt=""
        aria-hidden
        width={1120}
        height={980}
        fetchPriority="high"
        className="absolute -right-24 top-6 h-auto w-[560px] max-w-none rotate-[-8deg] opacity-35 md:-right-16 md:top-0 md:w-[720px] lg:-right-10 lg:top-8 lg:w-[880px] lg:opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-green-950/40 via-green-950/60 to-green-950 lg:bg-gradient-to-r lg:from-green-950 lg:via-green-950/85 lg:to-green-950/20" />
    </div>
  );
}
