import { Sun, Moon, LogOut, Menu, User } from "lucide-react";
import React, { useState } from "react";
import { useTheme } from "../contexts/themeContext";
import { useAuth } from "../contexts/authContext";

interface NavbarProps {
  readonly sidebarOpen: boolean;
  readonly toggleSidebar: () => void;
}

export default function Navbar({
  sidebarOpen,
  toggleSidebar
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

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
              <h1 className="text-xl font-semibold dark:text-white text-gray-900">Dashboard</h1>
            </header>
          </div>
          
          <div className="flex items-center">
            {user && (
              <div className="flex items-center mr-6">
                <span className={`text-lg mr-4 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  Hey {user.firstName}!
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => toggleTheme()}
              className={`p-2 rounded-full transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center p-2 rounded-full transition-colors duration-300 ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-label="User menu"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}