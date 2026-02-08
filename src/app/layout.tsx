import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Iron Forge Pro - Elite Gym Tracker",
  description: "A production-grade gym tracking application for serious lifters. Track your workouts, monitor progress, and achieve your fitness goals.",
  keywords: ["gym", "workout", "fitness", "tracking", "bodybuilding", "strength training"],
  authors: [{ name: "Iron Forge Pro" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Iron Forge Pro",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <main className="app-container">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
