"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;
  return (
    <button
      type="button"
      data-print-hide
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-4 bottom-4 z-30 flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-pop transition hover:opacity-90 sm:right-6 sm:bottom-6"
    >
      <ArrowUp className="size-5" aria-hidden />
    </button>
  );
}
