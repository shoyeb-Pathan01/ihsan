import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#111827",
};

export const metadata: Metadata = {
  title: "IQRA",
  description: "Learn. Build. Worship. Improve.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased" style={{ background: "#f6f7fb", color: "#172033" }}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-[#111827] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm">
          Skip to content
        </a>
        <div className="flex min-h-screen">
          <Sidebar />
          <main id="main-content" className="flex-1 p-7 max-w-[1500px] pb-20 lg:pb-7">
            {children}
          </main>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
