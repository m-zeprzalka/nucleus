import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org", // obrazy z Wikipedii/Commons
      },
    ],
  },
}

export default nextConfig
