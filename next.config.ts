
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https-6000-firebase-studio-1762452668457.cluster-fo5feun3fzf2etidpi3ckpp6te.cloudworkstations.dev",
    "https-6000-firebase-sellaya-backup-01-1762673440166.cluster-fo5feun3fzf2etidpi3ckpp6te.cloudworkstations.dev"
  ],
  serverActions: {
    bodySizeLimit: '2mb',
  },
};

export default nextConfig;
