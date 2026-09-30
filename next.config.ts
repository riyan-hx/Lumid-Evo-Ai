import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Let phones on the same Wi-Fi load dev assets (home/office LAN ranges).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
};

export default nextConfig;
