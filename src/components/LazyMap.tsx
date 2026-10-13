"use client";

import { useEffect, useRef, useState } from "react";
import { PinIcon } from "./Icons";

/** Static placeholder first; the Google Maps iframe loads only when scrolled near. */
export function LazyMap({ query, title, placeholder }: { query: string; title: string; placeholder: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div ref={ref} className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border border-line bg-paper md:aspect-[16/10]">
      {load ? (
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoad(true)}
          className="absolute inset-0 grid cursor-pointer place-items-center bg-[linear-gradient(90deg,rgb(30_91_60/.08)_1px,transparent_1px),linear-gradient(rgb(30_91_60/.08)_1px,transparent_1px)] bg-[size:32px_32px] text-green-900"
        >
          <span className="flex flex-col items-center gap-3 text-[15px] font-medium">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-green-700/30 bg-white"><PinIcon width={24} height={24} className="text-green-700" /></span>
            {placeholder}
          </span>
        </button>
      )}
    </div>
  );
}
