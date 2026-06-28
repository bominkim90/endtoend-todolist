import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker standalone 이미지 크기 최소화 — server.js + 필요한 node_modules만 포함
  output: "standalone",
};

export default nextConfig;
