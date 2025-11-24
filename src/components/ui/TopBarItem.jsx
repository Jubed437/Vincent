import React from 'react';
import { motion } from 'framer-motion';

const TopBarItem = ({ 
  id, 
  label, 
  icon: Icon, 
  isActive, 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  return (
    <motion.div
      whileHover={{ backgroundColor: disabled ? undefined : '#2a2d2e' }}
      className={`
        flex items-center justify-center px-4 py-3 cursor-pointer transition-all duration-200 relative group
        ${isActive ? 'text-vscode-accent' : 'text-vscode-text'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
    >
      <Icon size={20} className="flex-shrink-0" />
      
      {/* Tooltip on hover */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {disabled ? `${label} (No project loaded)` : label}
      </div>
    </motion.div>
  );
};

export default TopBarItem;