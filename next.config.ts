import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
  },
  /*
   * `/` used to 307 to /buccal-fat-removal, on the reasoning that the root
   * of an ads subdomain had nowhere better to go. With more than one page
   * that stopped being true — the redirect had to pick a favourite, and it
   * hid the others. `app/page.tsx` now lists them from `lib/pages.ts`.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
