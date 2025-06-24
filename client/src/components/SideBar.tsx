import React from "react";
import SideBarItem from "./SideBarItem";
import { useTheme } from "../contexts/themeContext";

import { Settings, Code2, Code, Video, Users } from "lucide-react";

interface SideBarProps {
  isExpanded: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ isExpanded }) => {
  const { theme } = useTheme();
  return (
    <aside
      className={`
        bg-white dark:bg-gray-800 flex flex-col transition-all duration-300 ease-in-out
        ${isExpanded ? "w-64" : "w-20"}
        h-screen overflow-y-auto fixed md:relative z-10
      `}
    >
      <div
        className={`
        flex items-center h-16 px-4
        ${isExpanded ? "justify-start" : "justify-center"}
      `}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
          <Code2
            className={`w-10 h-10 ${
              theme === "dark" ? "text-indigo-600" : "text-indigo-400"
            }`}
          />
        </div>
        {isExpanded && (
          <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">DeepCode</span>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        <SideBarItem
          icon={<Code size={20} />}
          label="Code Arena"
          isActive={window.location.pathname.includes('/code-arena')}
          isExpanded={isExpanded}
          path='/code-arena'
        />
        <SideBarItem
          icon={<Users size={20} />}
          label="Interview"
          isActive={window.location.pathname.includes('/interview')}
          isExpanded={isExpanded}
          path='/interview'
        />
        <SideBarItem
          icon={<Video size={20} />}
          label="Mock Arena"
          isActive={false}
          isExpanded={isExpanded}
        />
        <SideBarItem
          icon={<Settings size={20} />}
          label="Settings"
          isActive={false}
          isExpanded={isExpanded}
        />
      </nav>

      <div className={`
        flex items-center p-4 dark:bg-gray-600/20 rounded-t-xl
        ${isExpanded ? 'justify-start' : 'justify-center'}
      `}>
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          <span className="text-gray-600 font-medium">U</span>
        </div>
        {isExpanded && (
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">User Name</p>
            <p className="text-xs text-gray-500">user@example.com</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SideBar;