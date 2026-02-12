"use client";

import Image from "next/image";
import Link from "next/link";
import StatusBadge from "@/app/_components/status-badge";
import type { CommunityProduct } from "@/types/product";

export default function ProductCard({
  item,
  onVote,
}: {
  item: CommunityProduct;
  onVote?: (id: string) => void;
}) {
  const product = item.product;
  if (!product) return null;

  return (
    <Link
      href={`/result/${product.barcode}`}
      className="glass glass-interactive flex gap-3 rounded-2xl p-3"
    >
      {product.image_url ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl glass-subtle">
          <Image
            src={product.image_url}
            alt={product.product_name}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl glass-subtle text-2xl">
          📦
        </div>
      )}

      <div className="flex flex-1 flex-col justify-center gap-1 overflow-hidden">
        <p className="truncate font-medium text-label-primary">
          {product.product_name}
        </p>
        {product.brand && (
          <p className="truncate text-xs text-label-tertiary">
            {product.brand}
          </p>
        )}
        <div className="flex items-center gap-2">
          <StatusBadge result={product.analysis_result} size="sm" />
          <span className="text-xs text-label-tertiary">
            {item.scan_count} scan{item.scan_count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {onVote && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onVote(item.id);
          }}
          className="glass-subtle flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 active:scale-95 transition-transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4 text-clean"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
          <span className="text-xs font-medium text-label-secondary">
            {item.upvote_count}
          </span>
        </button>
      )}
    </Link>
  );
}
