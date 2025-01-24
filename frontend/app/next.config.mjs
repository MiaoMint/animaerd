import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "animaerd-storage.0u0.ren",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
