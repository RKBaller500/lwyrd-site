import type { NextConfig } from "next";

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

const supabaseHostname = safeHostname(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
// Fall back to wildcard if URL not available at build time
const supabaseConnect = supabaseHostname
  ? `https://${supabaseHostname} wss://${supabaseHostname}`
  : "https://*.supabase.co wss://*.supabase.co";
const imageRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "plus.unsplash.com" },
];

if (supabaseHostname) {
  imageRemotePatterns.push({
    protocol: "https",
    hostname: supabaseHostname,
    pathname: "/storage/v1/object/public/blog-images/**",
  });
}

const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

// Content-Security-Policy
// Notes:
// - 'unsafe-inline' in script-src is required for Next.js App Router hydration without nonces.
//   To strengthen this, configure nonce-based CSP in middleware (src/proxy.ts).
// - 'unsafe-inline' in style-src is required because components use style={{ }} for dynamic values.
// - img-src allows https: broadly because admin-entered firm logoUrls can come from any host.
// - frame-ancestors 'none' redundantly backs up X-Frame-Options: DENY for modern browsers.
const isDev = process.env.NODE_ENV === "development";

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${posthogHost}`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  `img-src 'self' data: blob: https:`,
  `connect-src 'self' ${supabaseConnect} ${posthogHost} https://formsubmit.co https://api.stripe.com`,
  `frame-src 'self' https://cal.com https://*.cal.com https://calendly.com https://*.calendly.com`,
  `frame-ancestors 'none'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self' https://formsubmit.co`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: cspDirectives },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    remotePatterns: imageRemotePatterns,
  },
};

export default nextConfig;
