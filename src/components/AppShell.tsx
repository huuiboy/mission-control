"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== "/login";

  return (
    <>
      {showSidebar ? <Sidebar /> : null}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </>
  );
}
