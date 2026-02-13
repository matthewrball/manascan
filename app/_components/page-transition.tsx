"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function getTabIndex(path: string): number {
  if (path === "/") return 0;
  if (
    path === "/scan" ||
    path.startsWith("/scan/") ||
    path.startsWith("/result/")
  )
    return 1;
  if (
    path === "/browse" ||
    path.startsWith("/browse/") ||
    path === "/history" ||
    path.startsWith("/history/")
  )
    return 2;
  return 1;
}

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = prevPathRef.current;
    if (prev === pathname) return;

    const prevIdx = getTabIndex(prev);
    const nextIdx = getTabIndex(pathname);
    prevPathRef.current = pathname;

    const el = containerRef.current;
    if (!el) return;

    // Cancel after finish to remove transform/filter —
    // these create a containing block that breaks position:fixed children
    const cancelOnFinish = (anim: Animation) => {
      anim.finished.then(() => anim.cancel());
    };

    // Same tab group (e.g. /scan → /result/123) — subtle fade only
    if (prevIdx === nextIdx) {
      cancelOnFinish(
        el.animate(
          [
            { opacity: 0 },
            { opacity: 1 },
          ],
          {
            duration: 200,
            easing: "ease-out",
            fill: "forwards",
          }
        )
      );
      return;
    }

    // Cross-tab navigation — directional slide
    const fromRight = nextIdx > prevIdx;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      cancelOnFinish(
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 150,
          easing: "ease-out",
          fill: "forwards",
        })
      );
      return;
    }

    cancelOnFinish(
      el.animate(
        [
          {
            opacity: 0,
            transform: `translateX(${fromRight ? "8%" : "-8%"})`,
          },
          {
            opacity: 1,
            transform: "translateX(0)",
          },
        ],
        {
          duration: 350,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        }
      )
    );
  }, [pathname]);

  return (
    <div ref={containerRef} className="h-full">
      {children}
    </div>
  );
}
