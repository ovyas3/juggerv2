import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";
import { SnackbarProvider } from '../hooks/snackBar';
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Instavans",
  description: "Smart Dashboard",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* Apply Inter class to the body */}
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <NextIntlClientProvider
            messages={messages}
            locale={locale}>
              <SnackbarProvider>  
                {children}
              </SnackbarProvider>
          </NextIntlClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
