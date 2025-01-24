import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: ['wagon-tally-sheet.s3.ap-south-1.amazonaws.com', 's3.ap-south-1.amazonaws.com'],
    },
    basePath: process.env.NODE_ENV === 'local' ? '' : '/dashV2',
};

export default withNextIntl(nextConfig);