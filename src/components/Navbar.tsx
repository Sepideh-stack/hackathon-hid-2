"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isSales = pathname.startsWith("/sales");
  const isVoc = pathname.startsWith("/voc");

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-[color:var(--border)] dark:bg-[color:var(--background)]/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[color:var(--primary)] shadow-[var(--shadow-sm)] transition-transform duration-200 group-hover:scale-[1.02]">
                <span className="text-white font-bold text-sm">Co</span>
              </div>
              <span className="font-semibold text-lg text-slate-900 dark:text-[color:var(--foreground)]">
                Cortexa
              </span>
            </Link>

            {!isHome && (
              <div className="flex gap-1">
                <Link
                  href="/sales"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSales
                      ? "bg-blue-50 text-blue-700 dark:bg-[color:var(--muted)] dark:text-[color:var(--primary)]"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[color:var(--muted)]"
                  }`}
                >
                  Sales View
                </Link>
                <Link
                  href="/voc"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isVoc
                      ? "bg-purple-50 text-purple-700 dark:bg-[color:var(--muted)] dark:text-[color:var(--accent)]"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[color:var(--muted)]"
                  }`}
                >
                  VoC Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {!isHome && (
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  isSales
                    ? "bg-blue-100 text-blue-700 dark:bg-[color:var(--muted)] dark:text-[color:var(--primary)]"
                    : "bg-purple-100 text-purple-700 dark:bg-[color:var(--muted)] dark:text-[color:var(--accent)]"
                }`}
              >
                {isSales
                  ? "Alex Berg - Sales Rep"
                  : "Priya Nordin - Product Manager"}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
