import { useEffect, useState } from "react";

/**
 * Reads both the OS `prefers-reduced-motion` setting and B4's explicit
 * `data-b4-motion` override on the nearest themed root, matching the CSS
 * contract in @b4/tokens' base.css: `data-b4-motion="full"` forces motion on
 * even under OS reduced-motion, and `data-b4-motion="reduced"` forces it off
 * regardless of OS setting. This is the single source of truth every B4
 * motion primitive (TextTransition, AnimatedIndicator, etc.) must call
 * before choosing a spring/tween vs. an instant state change.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => readReducedMotion());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(readReducedMotion());

    mediaQuery.addEventListener("change", update);

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-b4-motion"],
      subtree: true,
    });

    return () => {
      mediaQuery.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  return reduced;
}

function readReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  const override = document
    .querySelector("[data-b4-motion]")
    ?.getAttribute("data-b4-motion");

  if (override === "full") return false;
  if (override === "reduced") return true;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
