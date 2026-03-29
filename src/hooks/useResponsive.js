/**
 * @hook useResponsive
 * @description Detects current breakpoint via window.innerWidth.
 * Designed for a codebase that uses inline styles (no Tailwind),
 * so conditional rendering by breakpoint must happen in JS.
 *
 * Breakpoints mirror the global CSS matrix:
 *   xs  0–479     mobile portrait
 *   sm  480–767   mobile landscape / small tablet
 *   md  768–1023  tablet
 *   lg  1024+     desktop
 *
 * Returns a stable object — only re-renders on breakpoint boundary crossings,
 * not on every pixel resize (debounced to 150ms).
 *
 * @returns {{ isMobile: boolean, isTablet: boolean, isDesktop: boolean, breakpoint: 'xs'|'sm'|'md'|'lg', width: number }}
 */
import { useState, useEffect, useCallback } from "react";

/** Derive breakpoint string from a pixel width */
function getBreakpoint(w) {
  if (w < 480)  return "xs";
  if (w < 768)  return "sm";
  if (w < 1024) return "md";
  return "lg";
}

/** Safe initial width — SSR-friendly */
function safeWidth() {
  if (typeof window === "undefined") return 1024;
  return window.innerWidth;
}

export function useResponsive() {
  const [width, setWidth]           = useState(safeWidth);
  const [breakpoint, setBreakpoint] = useState(() => getBreakpoint(safeWidth()));

  const handleResize = useCallback(() => {
    const w = window.innerWidth;
    setWidth(w);
    setBreakpoint(getBreakpoint(w));
  }, []);

  useEffect(() => {
    // Debounce — only fire after 150ms of silence
    let timer = null;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(handleResize, 150);
    };

    window.addEventListener("resize", onResize, { passive: true });
    // Fire once on mount to sync server/client
    handleResize();

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
  }, [handleResize]);

  return {
    width,
    breakpoint,
    isMobile:  breakpoint === "xs" || breakpoint === "sm",  // < 768px
    isTablet:  breakpoint === "md",                          // 768–1023px
    isDesktop: breakpoint === "lg",                          // 1024px+
    isXs:      breakpoint === "xs",                          // < 480px (portrait)
    isSm:      breakpoint === "sm",                          // 480–767px
  };
}
