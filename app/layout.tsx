import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

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
    <html lang="de" className={`${geistSans.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-100 antialiased">
        <Navigation />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-4 text-center text-sm text-gray-400 dark:text-gray-500">
          Solarwerk Sued GmbH &middot; Stadtbergen
        </footer>
      </body>
    </html>
  );
}
