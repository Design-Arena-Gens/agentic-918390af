/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        canvas: 'commonjs canvas'
      });
    }
    return config;
  }
}

module.exports = nextConfig
