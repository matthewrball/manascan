import Image from "next/image";
import StatusBadge from "@/app/_components/status-badge";
import type { Product } from "@/types/product";

export default function ProductHeader({ product }: { product: Product }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-col items-center text-center">
        {product.image_url ? (
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl glass-subtle">
            <Image
              src={product.image_url}
              alt={product.product_name}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl glass-subtle text-4xl">
            📦
          </div>
        )}
        <div className="mt-2">
          <StatusBadge result={product.analysis_result} size="lg" />
        </div>
        <h1 className="mt-3 text-xl font-bold leading-tight text-label-primary">
          {product.product_name}
        </h1>
        {product.brand && (
          <p className="mt-1 text-sm text-label-tertiary">{product.brand}</p>
        )}
      </div>
    </div>
  );
}
