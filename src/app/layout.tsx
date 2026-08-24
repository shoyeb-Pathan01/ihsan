import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IHSAN",
  description: "Learn. Build. Worship. Improve.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased" style={{ background: "#f6f7fb", color: "#172033" }}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-7 max-w-[1500px] pb-20 lg:pb-7">
            {children}
          </main>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
