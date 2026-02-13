"use client";

import { useState, useCallback } from "react";
import type { Product } from "@/types/product";

export function useProductLookup() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (barcode: string) => {
    setLoading(true);
    setError(null);
    setProduct(null);

    try {
      const res = await fetch(`/api/product/${barcode}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Product not found");
      }

      setProduct(data.product);

      // Record scan event (fire and forget — don't block UI)
      const deviceId = getDeviceId();
      fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode,
          product_id: data.product.id,
          analysis_result: data.product.analysis_result,
          device_id: deviceId,
        }),
      }).catch(() => {
        // Non-critical, ignore failures
      });

      return data.product as Product;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to look up product";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { product, loading, error, lookup };
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("manascan-device-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("manascan-device-id", id);
  }
  return id;
}
