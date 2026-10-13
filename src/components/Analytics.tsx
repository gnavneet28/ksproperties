"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/attribution";
import { CLARITY_ID, GA4_ID, PIXEL_ID, trackPageView } from "@/lib/tracking";
import { retryQueuedLead } from "@/lib/leadQueue";

/**
 * Inline stubs so events fired before the vendor scripts arrive are queued.
 * The heavy scripts load after first interaction or 3 s, whichever is first.
 */
export function AnalyticsStubs() {
  const js = [
    PIXEL_ID &&
      `!function(f){if(f.fbq)return;var n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];n.disablePushState=!0}(window);fbq('init',${JSON.stringify(PIXEL_ID)});`,
    GA4_ID &&
      `window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',${JSON.stringify(GA4_ID)});`,
    CLARITY_ID && `window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments)};`,
  ]
    .filter(Boolean)
    .join("");
  if (!js) return null;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

function loadScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

let vendorsLoaded = false;
function loadVendors() {
  if (vendorsLoaded) return;
  vendorsLoaded = true;
  if (PIXEL_ID) loadScript("https://connect.facebook.net/en_US/fbevents.js");
  if (GA4_ID) loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`);
  if (CLARITY_ID) loadScript(`https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`);
}

export function Analytics() {
  const pathname = usePathname();
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    captureAttribution();
    retryQueuedLead();

    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    const trigger = () => {
      loadVendors();
      events.forEach((e) => window.removeEventListener(e, trigger));
    };
    events.forEach((e) => window.addEventListener(e, trigger, { once: true, passive: true }));
    const t = window.setTimeout(trigger, 3000);
    return () => {
      window.clearTimeout(t);
      events.forEach((e) => window.removeEventListener(e, trigger));
    };
  }, []);

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return null;
}
