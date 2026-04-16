import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { NotificationProvider } from "@/components/layout/NotificationContext";
import { AuthProvider } from "@/components/layout/AuthContext";
import { ThemeProvider } from "@/components/layout/ThemeContext";
import { ClientShell } from "@/components/layout/ClientShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YouTube Intelligence",
  description: "YouTube Intelligence dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <SidebarProvider>
                <ClientShell>{children}</ClientShell>
              </SidebarProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
