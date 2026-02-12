import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

export default withSerwist({
  reactStrictMode: false,
  allowedDevOrigins: ["*.trycloudflare.com"],
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.openfoodfacts.org" },
      { protocol: "https", hostname: "**.openfoodfacts.net" },
    ],
  },
});
