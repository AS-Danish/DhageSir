/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/mentors-forum",
        destination: "/mentors-forum/index.html",
      },
    ];
  },
};

export default nextConfig;
