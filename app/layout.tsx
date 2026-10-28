import type { Metadata } from "next";
import "./globals.css";
import "./refinements.css";
import {business} from '../lib/business';
import {pageMetadata} from '../lib/seo';
import {InstallProvider} from './components/Install';

export const metadata: Metadata = {
  ...pageMetadata('/'),
  metadataBase:new URL(business.site),
  applicationName:business.name,
  category:'restaurant',
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "RCC", statusBarStyle: "black-translucent" },
  icons: {
    icon: "/brand/icon-192.png",
    apple: "/brand/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-KE">
      <head><meta name="theme-color" content="#54151c" /><link rel="stylesheet" href="/fonts/fonts.css" /><link rel="stylesheet" href="/vendor/leaflet.css" /></head>
      <body className="antialiased"><InstallProvider>{children}</InstallProvider></body>
    </html>
  );
}
