import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "syroqhisadqybcgmeluv.supabase.co",
      },
    ],
  },
};

export default nextConfig;
