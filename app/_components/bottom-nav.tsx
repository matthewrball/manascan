"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in window.navigator &&
          (window.navigator as Navigator & { standalone: boolean }).standalone === true)
    );
  }, []);

  const isHome = pathname === "/";
  const isScan =
    pathname === "/scan" || pathname.startsWith("/scan/") || pathname.startsWith("/result/");
  const isBrowse =
    pathname === "/browse" ||
    pathname.startsWith("/browse/") ||
    pathname === "/history" ||
    pathname.startsWith("/history/");

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom flex items-end justify-center"
      style={{ paddingBottom: isStandalone ? 8 : 14 }}
    >
      <nav className="flex items-end gap-5 px-6">
        {/* Home */}
        <Link
          href="/"
          className={`glass-interactive flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
            isHome ? "glass-tint-primary text-primary" : "glass-subtle text-label-tertiary"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isHome ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isHome ? 0 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          </svg>
        </Link>

        {/* Scan — large center button */}
        <Link
          href="/scan"
          className={`glass-interactive flex h-[72px] w-[72px] items-center justify-center rounded-full transition-colors ${
            isScan ? "glass-tint-primary text-primary" : "glass-subtle text-label-tertiary"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={isScan ? 2.2 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
          >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" x2="17" y1="12" y2="12" />
          </svg>
        </Link>

        {/* Search / Browse */}
        <Link
          href="/browse"
          className={`glass-interactive flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
            isBrowse ? "glass-tint-primary text-primary" : "glass-subtle text-label-tertiary"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={isBrowse ? 2.2 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M21 12L9 12M21 6L9 6M21 18L9 18M5 12C5 12.5523 4.55228 13 4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11C4.55228 11 5 11.4477 5 12ZM5 6C5 6.55228 4.55228 7 4 7C3.44772 7 3 6.55228 3 6C3 5.44772 3.44772 5 4 5C4.55228 5 5 5.44772 5 6ZM5 18C5 18.5523 4.55228 19 4 19C3.44772 19 3 18.5523 3 18C3 17.4477 3.44772 17 4 17C4.55228 17 5 17.4477 5 18Z" />
          </svg>
        </Link>
      </nav>
    </div>
  );
}
