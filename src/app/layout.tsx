import type { Metadata } from "next";
import { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { appWithTranslation } from 'next-i18next';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RMS",
  description: "Rail Management System",
};

function RootLayout({
  children,
}: AppProps & { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

export default appWithTranslation(RootLayout);