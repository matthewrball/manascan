"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import StatusBadge from "@/app/_components/status-badge";
import type { Product } from "@/types/product";

interface ScanHistoryItem {
  barcode: string;
  scanned_at: string;
  product?: Product;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("manascan-scan-history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
    setLoading(false);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("manascan-scan-history");
    setHistory([]);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 safe-top">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-label-primary">History</h1>
          <p className="text-sm text-label-tertiary">Your recent scans</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="glass-subtle glass-interactive rounded-full px-3 py-1.5 text-sm text-label-tertiary"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-label-tertiary/20 border-t-primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="glass-subtle flex flex-col items-center gap-3 rounded-3xl py-12 text-center">
            <span className="text-4xl">📋</span>
            <p className="font-medium text-label-primary">No scan history</p>
            <p className="text-sm text-label-tertiary">
              Products you scan will appear here
            </p>
            <Link
              href="/scan"
              className="glass-tint-primary glass-interactive mt-2 rounded-full px-6 py-2.5 font-medium text-primary"
            >
              Start Scanning
            </Link>
          </div>
        ) : (
          history.map((item, i) => (
            <Link
              key={`${item.barcode}-${i}`}
              href={`/result/${item.barcode}`}
              className="glass glass-interactive flex items-center gap-3 rounded-2xl p-3"
            >
              {item.product?.image_url ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl glass-subtle">
                  <Image
                    src={item.product.image_url}
                    alt={item.product.product_name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl glass-subtle text-xl">
                  📦
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium text-label-primary">
                  {item.product?.product_name || `Barcode: ${item.barcode}`}
                </p>
                <p className="text-xs text-label-tertiary">
                  {new Date(item.scanned_at).toLocaleDateString()}
                </p>
              </div>
              {item.product && (
                <StatusBadge result={item.product.analysis_result} size="sm" />
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
