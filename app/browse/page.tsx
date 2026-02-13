"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ProductCard from "./_components/product-card";
import SearchBar from "./_components/search-bar";
import CategoryFilter from "./_components/category-filter";
import PullToRefresh from "./_components/pull-to-refresh";
import ProductDrawer from "@/app/scan/_components/product-drawer";
import type { CommunityProduct } from "@/types/product";

const PAGE_SIZE = 20;

export default function BrowsePage() {
  const [products, setProducts] = useState<CommunityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<CommunityProduct | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);
  const loadingMoreRef = useRef(loadingMore);
  hasMoreRef.current = hasMore;
  loadingRef.current = loading;
  loadingMoreRef.current = loadingMore;

  const fetchProducts = useCallback(async (pageNum: number, append: boolean) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("limit", String(PAGE_SIZE));
      if (search) params.set("search", search);
      if (category) params.set("category", category);

      const res = await fetch(`/api/community?${params}`);
      const data = await res.json();
      const fetched: CommunityProduct[] = data.products || [];

      setProducts((prev) => append ? [...prev, ...fetched] : fetched);
      setHasMore(pageNum * PAGE_SIZE < (data.total || 0));
    } catch {
      if (!append) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, category]);

  // Reset to page 1 when search/category changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    const timeout = setTimeout(() => fetchProducts(1, false), 300);
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  // Load more when page increments beyond 1
  useEffect(() => {
    if (page > 1) fetchProducts(page, true);
  }, [page, fetchProducts]);

  // Infinite scroll via IntersectionObserver (stable — no recreation on state change)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current && !loadingMoreRef.current) {
          setPage((p) => p + 1);
        }
      },
      { root: scrollAreaRef.current, rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleRefresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await fetchProducts(1, false);
  }, [fetchProducts]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  return (
    <PullToRefresh onRefresh={handleRefresh} scrollRef={scrollAreaRef}>
      <div className="mx-auto flex max-w-lg flex-col px-4" style={{ height: "100dvh" }}>
        {/* Fixed header — does not scroll with products */}
        <div className="shrink-0 pt-2 pb-2">
          <h1 className="mb-0.5 text-2xl font-bold text-label-primary">Browse</h1>
          <p className="mb-2 text-sm text-label-tertiary">
            Community-verified clean products
          </p>
          <div className="space-y-2">
            <SearchBar value={search} onChange={setSearch} />
            <CategoryFilter selected={category} onChange={setCategory} />
          </div>
        </div>

        {/* Scrollable product list */}
        <div ref={scrollAreaRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-3 pb-28">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-label-tertiary/20 border-t-primary" />
                <p className="text-sm text-label-tertiary">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="animate-fadeIn glass-subtle flex flex-col items-center gap-3 rounded-3xl py-12 text-center">
                <span className="text-4xl">🌱</span>
                <p className="font-medium text-label-primary">No products yet</p>
                <p className="text-sm text-label-tertiary">
                  Scan clean products to help build the community list!
                </p>
              </div>
            ) : (
              <div className="animate-fadeIn space-y-3">
                {products.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onVote={handleVote}
                    onSelect={setSelectedProduct}
                  />
                ))}

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="h-px" />

                {loadingMore && (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-label-tertiary/20 border-t-primary" />
                  </div>
                )}

                {!hasMore && products.length > 0 && (
                  <p className="py-4 text-center text-xs text-label-tertiary">
                    All {products.length} products loaded
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <ProductDrawer
          product={selectedProduct?.product ?? null}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          closeLabel="Close"
        />
      </div>
    </PullToRefresh>
  );
}
