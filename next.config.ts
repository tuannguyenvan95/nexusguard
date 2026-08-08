import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Demo avatars + the MetaMask brand logo rendered via next/image.
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
    // The MetaMask logo is an SVG served from upload.wikimedia.org.
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
