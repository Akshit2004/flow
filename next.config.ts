import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose', 'jose', 'bcryptjs', 'nodemailer'],
};

export default nextConfig;
