import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ContextMenuProvider } from "@/context/ContextMenuContext";
import ContextMenu from "@/components/ui/ContextMenu";
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Flow",
  description: "Modern Project Management Tool",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning={true}>
        <NextTopLoader 
          color="#2563EB"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563EB,0 0 5px #2563EB"
          zIndex={1600}
        />
        <ThemeProvider>
          <ToastProvider>
            <ContextMenuProvider>
              <ContextMenu />
              {children}
            </ContextMenuProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
