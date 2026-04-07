"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { PageTransition } from "./PageTransition";
import { useAuth } from "./AuthContext";
import type { ReactNode } from "react";

export function ClientShell({ children }: { children: ReactNode }) {
  const pathname        = usePathname();
  const router          = useRouter();
  const { isAuthenticated } = useAuth();

  const isLoginPage = pathname === "/";

  // Redirect to login whenever not authenticated and not already there
  useEffect(() => {
    if (!isAuthenticated && !isLoginPage) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoginPage, router]);

  // While redirecting, render nothing to avoid a flash of protected content
  if (!isAuthenticated && !isLoginPage) return null;

  return (
    <div className="flex h-screen flex-col">
      {!isLoginPage && <Header />}
      <div className="flex min-h-0 flex-1">
        {!isLoginPage && <Sidebar />}
        <main
          className="min-w-0 flex-1 overflow-auto bg-[#F5F5F5]"
          style={{ scrollbarGutter: "stable" }}
        >
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
