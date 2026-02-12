"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

const THRESHOLD = 72;
const MAX_PULL = 140;
const RESISTANCE = 0.4;
const MIN_REFRESH_MS = 800;
const SETTLE_MS = 500;
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return null;
}

export default function PullToRefresh({
  onRefresh,
  children,
  scrollRef,
}: {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  scrollRef?: React.RefObject<HTMLElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [settling, setSettling] = useState(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (refreshing) return;
      const scrollEl = scrollRef?.current || getScrollParent(containerRef.current);
      if (scrollEl && scrollEl.scrollTop > 0) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    },
    [refreshing, scrollRef]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!pulling.current || refreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        setDistance(0);
        return;
      }
      e.preventDefault();
      // Progressive resistance: gets heavier the further you pull
      const raw = dy * RESISTANCE;
      const dampened = MAX_PULL * (1 - Math.exp(-raw / MAX_PULL));
      setDistance(dampened);
    },
    [refreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (distance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setSettling(true);
      setDistance(52);

      const start = Date.now();
      try {
        await onRefresh();
      } finally {
        // Ensure the spinner is visible long enough to feel intentional
        const elapsed = Date.now() - start;
        const remaining = Math.max(MIN_REFRESH_MS - elapsed, 0);
        await new Promise((r) => setTimeout(r, remaining));

        setRefreshing(false);
        setDistance(0);
        setTimeout(() => setSettling(false), SETTLE_MS);
      }
    } else {
      setSettling(true);
      setDistance(0);
      setTimeout(() => setSettling(false), SETTLE_MS);
    }
  }, [distance, refreshing, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(distance / THRESHOLD, 1);
  const settleTransition = `transform ${SETTLE_MS}ms ${EASE}, opacity ${SETTLE_MS}ms ease`;
  const transition = settling ? settleTransition : "none";

  return (
    <div ref={containerRef} className="relative">
      {/* Indicator */}
      <div
        className="pointer-events-none absolute left-0 right-0 flex justify-center"
        style={{
          top: -40,
          transform: `translateY(${distance}px)`,
          opacity: refreshing ? 1 : Math.min(progress * 1.5, 1),
          transition,
        }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(44,44,46,0.4))",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.1)",
            transform: `scale(${0.6 + progress * 0.4})`,
            transition: settling ? `transform ${SETTLE_MS}ms ${EASE}` : "none",
          }}
        >
          {refreshing ? (
            <div className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-label-tertiary/20 border-t-primary" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px] text-primary"
              style={{
                transform: `rotate(${progress * 180}deg)`,
                transition: settling ? `transform ${SETTLE_MS}ms ease` : "none",
              }}
            >
              <line x1="12" x2="12" y1="19" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${distance}px)`,
          transition: settling ? `transform ${SETTLE_MS}ms ${EASE}` : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
