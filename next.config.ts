import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Povolení cross-origin přístupu z 127.0.0.1 (Playwright + ruční testování)
  // a běžných dev hostů; v produkci tento flag neplatí.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
