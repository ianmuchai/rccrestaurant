import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RCC Restaurant | Kitengela",
  description: "A little indulgence. Explore RCC's menu, choose delivery or pickup, and enjoy your favourites in Kitengela.",
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
    <html lang="en">
      <head><meta name="theme-color" content="#54151c" /><link rel="stylesheet" href="/vendor/leaflet.css" /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
