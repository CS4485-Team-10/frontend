"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { NotificationProvider } from "@/components/layout/NotificationContext";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 1. Define the "Lockdown" condition
  // If the pathname is just "/" (where your login is), we hide the nav
  const isLoginPage = pathname === "/";

  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <NotificationProvider>
            <div className="flex h-screen bg-[#F9F9F9]">
              {/* 2. ONLY show Sidebar if NOT on login page */}
              {!isLoginPage && <Sidebar />}
              
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* 3. ONLY show Header if NOT on login page */}
                {!isLoginPage && <Header />}
                
                <main className="flex-1 overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>
          </NotificationProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}