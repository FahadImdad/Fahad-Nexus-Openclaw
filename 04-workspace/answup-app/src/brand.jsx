import { useEffect, useState } from "react";

/* ============================================================
   ANSWUP BRAND CORE
   Logo (wave bars → handset) + light/dark theme engine
   ============================================================ */

/* ---- Logo mark: 4 sound-wave bars + phone handset ---- */
export function LogoMark({ size = 34, mono = false, light = false }) {
  // mono: single-color (inherits currentColor) · light: all-white version
  const bar = mono ? "currentColor" : light ? "#fff" : "var(--blue)";
  const phone = mono ? "currentColor" : light ? "#fff" : "var(--blue)";
  return (
    <svg width={size} height={size} viewBox="0 0 72 64" fill="none" aria-hidden="true">
      <rect x="1" y="25" width="7" height="14" rx="3.5" fill={bar} />
      <rect x="12" y="18" width="7" height="28" rx="3.5" fill={bar} />
      <rect x="23" y="8" width="7" height="48" rx="3.5" fill={bar} />
      <rect x="34" y="13" width="7" height="38" rx="3.5" fill={bar} />
      <path
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill={phone}
        transform="translate(39.5,15.5) scale(1.38)"
      />
    </svg>
  );
}

/* ---- Full logo: mark + wordmark ---- */
export function Logo({ size = 30, className = "", onClick }) {
  return (
    <span className={`logo ${className}`} onClick={onClick}>
      <LogoMark size={size} />
      <span className="logo-word">answup</span>
    </span>
  );
}

/* ---- Animated equalizer (live-answering motif) ---- */
export function Equalizer({ bars = 5, className = "" }) {
  return (
    <span className={`eq ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <i key={i} style={{ animationDelay: `${i * 0.13}s` }} />
      ))}
    </span>
  );
}

/* ============================================================
   THEME ENGINE
   ============================================================ */
const KEY = "answup-theme";

export function initTheme() {
  const saved = localStorage.getItem(KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.dataset.theme = theme;
}

export function useTheme() {
  const [theme, setThemeState] = useState(
    () => document.documentElement.dataset.theme || "light"
  );
  const setTheme = (t) => {
    document.documentElement.dataset.theme = t;
    localStorage.setItem(KEY, t);
    setThemeState(t);
  };
  return [theme, setTheme];
}

/* ---- Sun/moon toggle button ---- */
export function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      className={`theme-btn ${className}`}
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <span className="theme-ico" key={theme}>
        {theme === "dark" ? (
          /* sun */
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.4M12 19.1v2.4M4.28 4.28l1.7 1.7M18.02 18.02l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.28 19.72l1.7-1.7M18.02 5.98l1.7-1.7" />
          </svg>
        ) : (
          /* moon */
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.8A8.6 8.6 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </span>
    </button>
  );
}
