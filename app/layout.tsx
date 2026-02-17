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
  title: "MotoLight - Fog Light Selection Tool",
  description:
    "Check safe watt capacity and configure motorcycle fog light recommendations.",
  alternates: {
    canonical: "/",
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
