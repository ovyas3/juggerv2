import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RMS",
  description: "Rail Management System",
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
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <NextIntlClientProvider
            messages={messages}
            locale={locale}>
              {children}
          </NextIntlClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

// export default appWithTranslation(RootLayout);