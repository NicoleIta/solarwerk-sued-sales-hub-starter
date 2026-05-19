import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navigation from "./nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solarwerk Sued - Sales-Hub",
  description: "Vertriebs-Dashboard fuer Solarwerk Sued GmbH",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-[family-name:var(--font-geist-sans)] text-gray-900 antialiased">
        <Navigation />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-400">
          Solarwerk Sued GmbH &middot; Stadtbergen
        </footer>
      </body>
    </html>
  );
}
