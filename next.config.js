/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Für Raspberry Pi optimiert
  poweredByHeader: false,
}

module.exports = nextConfig

