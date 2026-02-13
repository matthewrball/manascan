import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  CacheFirst,
  StaleWhileRevalidate,
  ExpirationPlugin,
  CacheableResponsePlugin,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Cache Open Food Facts product images aggressively
    {
      matcher: ({ url }) =>
        url.hostname.includes("openfoodfacts.org") ||
        url.hostname.includes("openfoodfacts.net"),
      handler: new CacheFirst({
        cacheName: "product-images",
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({
            maxEntries: 500,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    // Cache Next.js optimized images
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/image"),
      handler: new StaleWhileRevalidate({
        cacheName: "next-images",
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          }),
        ],
      }),
    },
    // Cache GET API responses briefly (exclude POST mutations)
    {
      matcher: ({ url, request }) =>
        url.pathname.startsWith("/api/") && request.method === "GET",
      handler: new StaleWhileRevalidate({
        cacheName: "api-cache",
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
