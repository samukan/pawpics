/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io', // uploadthing's domain
        port: '',
        pathname: '/**',
      },
      {
        // Add any other domains you might be using for images
        protocol: 'https',
        hostname: '**.uploadthing.com',
        port: '',
        pathname: '/**',
      },
      {
        // Add the specific domain from the error message
        protocol: 'https',
        hostname: 'uixixjzhbk.ufs.sh',
        port: '',
        pathname: '/**',
      },
      {
        // Add a more generic pattern to cover all uploadthing subdomains
        protocol: 'https',
        hostname: '**.ufs.sh',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
