/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  allowedDevOrigins: [
    "*.loca.lt",
    "*.trycloudflare.com",
    "172.22.192.1",
    "172.22.192.1:3000",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "**.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "graph.facebook.com",
      },
      {
        protocol: "https",
        hostname: "**.facebook.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/donatur",
        destination: "/donatur/dashboard",
        permanent: true,
      },
      {
        source: "/dashboard-donatur",
        destination: "/donatur/dashboard",
        permanent: true,
      },
      {
        source: "/riwayat-donasi",
        destination: "/donatur/riwayat",
        permanent: true,
      },
      {
        source: "/profil",
        destination: "/donatur/profil",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(img|icons)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.unsplash.com https://*.googleusercontent.com https://*.gstatic.com https://*.fbcdn.net https://*.fbsbx.com https://*.facebook.com https://*.cdninstagram.com https://*.r2.dev https://*.midtrans.com",
              "font-src 'self' data:",
              "connect-src 'self' https://app.sandbox.midtrans.com https://api.sandbox.midtrans.com https://app.midtrans.com https://api.midtrans.com",
              "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

