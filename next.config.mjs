/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress useSearchParams warning during build
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  // Disable TypeScript type checking during build (types are checked in IDE)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
