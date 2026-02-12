"use client";

import { useState, useEffect, useCallback } from "react";
import ProductCard from "./_components/product-card";
import SearchBar from "./_components/search-bar";
import CategoryFilter from "./_components/category-filter";
import ProductDrawer from "@/app/scan/_components/product-drawer";
import type { CommunityProduct } from "@/types/product";

export default function BrowsePage() {
  const [products, setProducts] = useState<CommunityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<CommunityProduct | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);

      const res = await fetch(`/api/community?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  const handleVote = async (communityProductId: string) => {
    const deviceId =
      localStorage.getItem("manascan-device-id") || crypto.randomUUID();
    localStorage.setItem("manascan-device-id", deviceId);

    const res = await fetch("/api/community/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        community_product_id: communityProductId,
        device_id: deviceId,
        vote_type: "upvote",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setProducts((prev) =>
        prev.map((p) =>
          p.id === communityProductId
            ? { ...p, upvote_count: data.upvote_count }
            : p
        )
      );
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 safe-top">
      <h1 className="mb-1 text-2xl font-bold text-label-primary">Browse</h1>
      <p className="mb-4 text-sm text-label-tertiary">
        Community-verified clean products
      </p>

      <div className="space-y-3">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-label-tertiary/20 border-t-primary" />
            <p className="text-sm text-label-tertiary">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="glass-subtle flex flex-col items-center gap-3 rounded-3xl py-12 text-center">
            <span className="text-4xl">🌱</span>
            <p className="font-medium text-label-primary">No products yet</p>
            <p className="text-sm text-label-tertiary">
              Scan clean products to help build the community list!
            </p>
          </div>
        ) : (
          products.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onVote={handleVote}
              onSelect={setSelectedProduct}
            />
          ))
        )}
      </div>

      <ProductDrawer
        product={selectedProduct?.product ?? null}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        closeLabel="Close"
      />
    </div>
  );
}
