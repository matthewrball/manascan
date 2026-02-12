import Image from "next/image";
import StatusBadge from "@/app/_components/status-badge";
import type { Product } from "@/types/product";

export default function ProductHeader({ product }: { product: Product }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex gap-4">
        {product.image_url ? (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl glass-subtle">
            <Image
              src={product.image_url}
              alt={product.product_name}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl glass-subtle text-3xl">
            📦
          </div>
        )}
        <div className="flex flex-col justify-center gap-2">
          <h1 className="text-xl font-bold leading-tight text-label-primary">
            {product.product_name}
          </h1>
          {product.brand && (
            <p className="text-sm text-label-tertiary">{product.brand}</p>
          )}
          <StatusBadge result={product.analysis_result} />
        </div>
      </div>
    </div>
  );
}
