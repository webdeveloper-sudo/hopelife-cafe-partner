import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "sonner";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "HOPE Cafe Partner Hub | Hospitality Network",
  description: "Join the HOPE Cafe Channel Program and earn commissions by referring guests.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HOPE Hub",
  },
  applicationName: "HOPE Cafe Partner Hub",
};

export const viewport = {
  themeColor: "#7030A0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${poppins.className} antialiased min-h-screen bg-surface-light`}>
        <Toaster richColors position="top-center" />
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
