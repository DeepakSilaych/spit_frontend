import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function MainLayout({ children }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-blue-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto pr-6">
          <div className="h-full w-full rounded-t-lg bg-white/95 p-6 border-[1px] border-gray-300 shadow-lg">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 