import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Évite que Next remonte jusqu'à un lockfile parent (ex. ~/pnpm-lock.yaml)
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
};

export default nextConfig;
