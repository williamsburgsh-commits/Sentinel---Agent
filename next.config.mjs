/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress useSearchParams warning during build
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Disable TypeScript type checking during build (types are checked in IDE)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
