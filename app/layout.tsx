import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header, Sidebar, SidebarProvider, NotificationProvider } from "@/components/layout";
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <NotificationProvider>
          <SidebarProvider>
            <div className="flex h-screen flex-col">
              <Header />
              <div className="flex min-h-0 flex-1">
                  <Sidebar />
                <main className="page-enter min-w-0 flex-1 overflow-auto bg-[#F5F5F5]">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
