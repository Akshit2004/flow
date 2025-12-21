import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose', 'jose', 'bcryptjs'],
};

export default nextConfig;
