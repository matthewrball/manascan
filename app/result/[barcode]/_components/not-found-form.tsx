"use client";

import Link from "next/link";

export default function NotFoundForm({ barcode }: { barcode: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="glass-prominent flex h-20 w-20 items-center justify-center rounded-full text-4xl">
        🔍
      </div>
      <h1 className="mt-6 text-2xl font-bold text-label-primary">
        Product Not Found
      </h1>
      <p className="mt-2 text-label-secondary">
        We couldn&apos;t find a product with barcode{" "}
        <span className="font-mono font-medium">{barcode}</span> in the Open
        Food Facts database.
      </p>
      <div className="mt-6 flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/scan"
          className="glass-tint-primary glass-interactive flex h-12 items-center justify-center rounded-full font-medium text-primary"
        >
          Scan Another Product
        </Link>
        <a
          href={`https://world.openfoodfacts.org/cgi/product.pl?code=${barcode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-subtle glass-interactive flex h-12 items-center justify-center rounded-full font-medium text-label-secondary"
        >
          Add to Open Food Facts
        </a>
      </div>
    </div>
  );
}
