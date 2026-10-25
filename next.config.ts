import type { NextConfig } from "next";

/**
 * Standalone output is only produced for container builds.
 *
 * `output: "standalone"` emits a self-contained server directory (used by the
 * Dockerfile) but does not include `_next/static`, which is why `next start`
 * warns about it. Locally we run `next start`, which serves the normal build
 * output, so the flag is enabled only when the build asks for it.
 */
const isContainerBuild = process.env.STANDALONE === "1";

/**
 * Security headers applied to every route.
 *
 * The CSP keeps `'unsafe-inline'` for script-src and style-src because the
 * framework injects inline bootstrap and style tags; the remaining directives
 * (object-src, base-uri, frame-ancestors, form-action) cut off the injection
 * paths that matter for a site with no user input, no uploads from the public
 * and no third-party scripts. ARCHITECTURE.md §16 documents the nonce-based
 * hardening path.
 *
 * `img-src` allows Google's image hosts because portfolio photography is served
 * from Drive (see `lib/media/drive.ts`).
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: https://lh3.googleusercontent.com https://drive.google.com",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  ...(isContainerBuild ? { output: "standalone" as const } : {}),
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    // Curated widths: nothing on this site is displayed wider than ~1200px, so
    // the optimizer never generates (and a browser never downloads) a 3840px file.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    // Portfolio photography is served from Google Drive.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
