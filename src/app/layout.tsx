import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { ThemeProvider } from "@/components/ThemeProvider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#161412" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
    <html lang="en" className={`${plusJakarta.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('iqra-theme');
              var hour = new Date().getHours();
              var isDark = theme === 'dark' || (theme !== 'light' && (hour >= 19 || hour < 7) && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (isDark) document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-full antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-[var(--color-foreground)] focus:text-[var(--color-background)] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm">
          Skip to content
        </a>
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main id="main-content" className="flex-1 px-4 py-6 max-w-[640px] mx-auto pb-24 lg:pb-7 lg:px-7">
              {children}
            </main>
            <MobileNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
