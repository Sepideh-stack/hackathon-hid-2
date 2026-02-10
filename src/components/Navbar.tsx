"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isSales = pathname.startsWith("/sales");
  const isVoc = pathname.startsWith("/voc");

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">2H</span>
              </div>
              <span className="font-semibold text-lg text-slate-900">
                2Hero
              </span>
            </Link>

            {!isHome && (
              <div className="flex gap-1">
                <Link
                  href="/sales"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSales
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Sales View
                </Link>
                <Link
                  href="/voc"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isVoc
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  VoC Dashboard
                </Link>
              </div>
            )}
          </div>

          {!isHome && (
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  isSales
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {isSales ? "Alex Berg - Sales Rep" : "Priya Nordin - Product Manager"}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
