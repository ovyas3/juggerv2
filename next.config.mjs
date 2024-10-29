import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    // output: 'export',
    images: {
        domains: ['wagon-tally-sheet.s3.ap-south-1.amazonaws.com'],
    },
};

export default withNextIntl(nextConfig);