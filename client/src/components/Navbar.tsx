import { Sun, Moon, LogOut, Menu } from "lucide-react";
import React from "react";
import { useTheme } from "../contexts/themeContext";

interface NavbarProps {
  readonly sidebarOpen: boolean;
  readonly toggleSidebar: () => void;
}

export default function Navbar({
  sidebarOpen,
  toggleSidebar
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
      <nav
        key={theme}
        className={`sticky top-0 z-10 border-l border-gray-700 transition-all duration-300 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <header className="flex items-center h-16 bg-white dark:bg-gray-800">
                <button 
                  onClick={toggleSidebar}
                  className="p-2 mr-4 text-gray-600 rounded-md hover:bg-gray-100 transition-all duration-300"
                  aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                  <Menu size={24} />
                </button>
                <h1 className="text-xl font-semibold dark:text-white text-gray-900 ">Dashboard</h1>
              </header>
            </div>
            <div className="flex items-center">
              <h1
                className={`text-xl mr-20 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Hey Deepak!
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleTheme()}
                className={`transition-colors ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            <button
            className={`p-2 rounded-full transition-colors duration-300 ${
                theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-label="Logout"
            >
            <LogOut size={20} /> 
            </button>

            </div>
          </div>
        </div>
      </nav>
  );
}
