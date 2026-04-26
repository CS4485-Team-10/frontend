import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  async redirects() {
    return [
      { source: "/", destination: "/executive-overview", permanent: false },
    ];
  },
};

export default nextConfig;
