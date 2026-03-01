/** @type {import('next').NextConfig} */

const backendConnectSrc = process.env.NEXT_PUBLIC_SERVER
  ? new URL(process.env.NEXT_PUBLIC_SERVER).origin // Get just the origin (protocol + hostname + port)
  : 'http://localhost:8000'; // Fallback for local dev if NEXT_PUBLIC_SERVER isn't set

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "is1-ssl.mzstatic.com"
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline';

              font-src 'self';
              img-src 'self' blob: data: https://is1-ssl.mzstatic.com;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              connect-src 'self' ${backendConnectSrc};
            `
            .replace(/\s{2,}/g, ' ')
            .trim(),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  eslint: {
    dirs: ['pages', 'utils'], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
  },
};

export default nextConfig;