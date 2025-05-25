import React from "react";
import { Link } from "react-router-dom";

interface SideBarItemProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    isExpanded: boolean;
    path?:string;
}

const SideBarItem: React.FC<SideBarItemProps> = ({
    icon,
    label,
    isActive,
    isExpanded,
    path
})=> {
    return (
        <Link to={path || '#'}
            className={`
            flex items-center p-2 rounded-md transition-all duration-300
            ${isActive 
            ? 'dark:bg-gray-700 dark:text-white bg-gray-100' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
            ${isExpanded ? 'justify-start' : 'justify-center'}`}
        >
            <div className="flex-shrink-0">
                {icon}
            </div>
            {isExpanded && (
            <span className="ml-3 text-sm font-medium transition-opacity duration-300">
            {label}
            </span>)}
        </Link>
    );
};

export default SideBarItem;