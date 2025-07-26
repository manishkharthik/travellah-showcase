import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⛔ Skip ESLint errors during Vercel builds
  },
  typescript: {
    ignoreBuildErrors: true, // ⛔ Skip TypeScript errors during build
  },
  images: {
    domains: ["cnsopxslkdtmouiohgda.supabase.co"], // ✅ your Supabase storage domain
  },
};

export default nextConfig;
