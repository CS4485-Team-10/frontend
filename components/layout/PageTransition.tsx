"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function AnimatedPage({ children }: { children: ReactNode }) {
  return (
    <div className="page-anim-wrapper page-anim min-h-full">
      {children}
    </div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <AnimatedPage key={pathname}>{children}</AnimatedPage>;
}
