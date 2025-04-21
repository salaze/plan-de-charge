
import React from "react";
interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}
export function Header({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-4">
      <button
        className="md:hidden p-2"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Ouvrir/fermer le menu"
      >
        <span className="material-icons">{isSidebarOpen ? "close" : "menu"}</span>
      </button>
      <div className="text-lg font-bold text-primary">Mon Application</div>
    </header>
  );
}
