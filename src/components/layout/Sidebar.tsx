
import React from "react";
interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}
export function Sidebar({ isSidebarOpen }: SidebarProps) {
  return (
    <aside
      className={`${
        isSidebarOpen ? "block" : "hidden"
      } md:block bg-white border-r min-w-[200px] p-4 h-full`}
    >
      <nav>
        {/* Ajoutez ici vos liens de navigation */}
        <ul className="space-y-2">
          <li>
            <a href="/admin" className="font-semibold text-gray-700">
              Administration
            </a>
          </li>
          <li>
            <a href="/employees" className="text-gray-700">
              Employés
            </a>
          </li>
          <li>
            <a href="/" className="text-gray-700">
              Planning
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
