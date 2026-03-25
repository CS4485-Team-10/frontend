"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";

const navItems = [
  {
    href: "/",
    label: "Executive Overview",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
        <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" />
        <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z" />
      </svg>
    ),
  },
  {
    href: "/narrative-discovery",
    label: "Narrative Discovery",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
      </svg>
    ),
  },
  {
    href: "/claim-validation",
    label: "Claim Validation",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    ),
  },
  {
    href: "/trend-analytics",
    label: "Trend Analytics",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
        <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
      </svg>
    ),
  },
  {
    href: "/creator-risk-monitor",
    label: "Creator Risk Monitor",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
      </svg>
    ),
  },
  {
    href: "/alerts-settings",
    label: "Alerts/Settings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-white/10 bg-[#1A1A1A] font-sans transition-[width] duration-200 ease-out ${
        collapsed ? "w-14" : "w-[240px]"
      }`}
    >
      <nav
        id="sidebar-nav"
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden p-2 pt-2"
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-md py-2.5 text-sm text-white transition-colors hover:bg-[#2D2D2D] ${
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${isActive ? "bg-[#2D2D2D] font-semibold" : "font-normal"}`}
            >
              <span className="shrink-0 text-white">{item.icon}</span>
              <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
