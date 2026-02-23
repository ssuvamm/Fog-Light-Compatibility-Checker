import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "LuxFit by Lumevo | Motorcycle Fog Light Compatibility Tool",
    template: "%s | LuxFit by Lumevo",
  },
  description:
    "Check safe electrical capacity, compare load usage, and get motorcycle fog light compatibility recommendations.",
  applicationName: "LuxFit by Lumevo",
  keywords: [
    "LuxFit by Lumevo",
    "motorcycle fog light compatibility",
    "motorcycle electrical capacity calculator",
    "bike fog light wattage checker",
    "aux light load calculator",
  ],
  authors: [{ name: "Lumevo" }],
  creator: "Lumevo",
  publisher: "Lumevo",
  metadataBase: new URL("https://apps.lumevo.in"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/LuxFit logo.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/icon.svg"],
    apple: ["/icon.svg"],
  },
  openGraph: {
    title: "LuxFit by Lumevo | Motorcycle Fog Light Compatibility Tool",
    description:
      "Check safe electrical capacity, compare load usage, and get motorcycle fog light compatibility recommendations.",
    type: "website",
    siteName: "LuxFit by Lumevo",
    url: "/",
    images: [
      {
        url: "/og-card.png",
        width: 1200,
        height: 630,
        alt: "LuxFit by Lumevo report",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LuxFit by Lumevo | Motorcycle Fog Light Compatibility Tool",
    description:
      "Check safe electrical capacity, compare load usage, and get motorcycle fog light compatibility recommendations.",
    images: ["/og-card.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ConvexClientProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
