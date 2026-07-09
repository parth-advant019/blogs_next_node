import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "syroqhisadqybcgmeluv.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3900",
        pathname: "/blog-thumbnails/**",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
