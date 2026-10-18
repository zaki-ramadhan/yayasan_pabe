/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["169.254.236.147", "169.254.236.147:3000", "localhost:3000", "127.0.0.1:3000"],
  images: {
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
        hostname: "graph.facebook.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
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
};

export default nextConfig;

