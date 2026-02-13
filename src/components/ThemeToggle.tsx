"use client";

import { useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")
    .matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  // Keep <html> class and localStorage in sync
  useEffect(() => {
    applyTheme(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const nextTheme = useMemo<Theme>(() => (theme === "dark" ? "light" : "dark"), [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="group relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all dark:border-[color:var(--border)] dark:bg-[color:var(--card)] dark:text-slate-200 dark:hover:bg-[color:var(--muted)]"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {/* Sun */}
      <svg
        className="w-5 h-5 transition-all duration-300 ease-out origin-center scale-100 rotate-0 opacity-100 dark:scale-0 dark:-rotate-90 dark:opacity-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        />
        <path strokeLinecap="round" d="M12 2v2" />
        <path strokeLinecap="round" d="M12 20v2" />
        <path strokeLinecap="round" d="m4.93 4.93 1.41 1.41" />
        <path strokeLinecap="round" d="m17.66 17.66 1.41 1.41" />
        <path strokeLinecap="round" d="M2 12h2" />
        <path strokeLinecap="round" d="M20 12h2" />
        <path strokeLinecap="round" d="m4.93 19.07 1.41-1.41" />
        <path strokeLinecap="round" d="m17.66 6.34 1.41-1.41" />
      </svg>

      {/* Moon */}
      <svg
        className="absolute w-5 h-5 transition-all duration-300 ease-out origin-center scale-0 rotate-90 opacity-0 dark:scale-100 dark:rotate-0 dark:opacity-100"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12.8A8.5 8.5 0 0 1 11.2 3a6.5 6.5 0 1 0 9.8 9.8Z"
        />
      </svg>
    </button>
  );
}
