import type { Metadata, Viewport } from "next";
import { AuthProvider } from "../lib/auth-context";
import { ThemeProvider } from "../components/ThemeProvider";
import { Toaster } from "sonner";
import PWAInstaller from "../components/PWAInstaller";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unmotivated Hero",
  description: "Automate your social media presence across YouTube, Instagram, Facebook, and TikTok",
  applicationName: "Unmotivated Hero",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Unmotivated Hero",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="UH" />
      </head>
      <body className="antialiased bg-gray-50 dark:bg-gray-900 font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
          </AuthProvider>
          <PWAInstaller />
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
