import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { useUIStore } from '../../store/uiStore';

const SidebarItem = ({ 
  id, 
  label, 
  icon: Icon, 
  isActive, 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  const { isIconOnlyMode } = useUIStore();
  const iconOnly = isIconOnlyMode();

  if (iconOnly) {
    return (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        size="sm"
        icon={Icon}
        onClick={onClick}
        className={`p-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        title={disabled ? `${label} (No project loaded)` : label}
        disabled={disabled}
      />
    );
  }

  return (
    <motion.button
      whileHover={{ backgroundColor: '#2a2d2e' }}
      className={`
        w-full flex items-center gap-3 px-3 py-2 text-sm text-left
        ${isActive ? 'bg-vscode-active text-vscode-accent' : 'text-vscode-text hover:text-vscode-text'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
      title={disabled ? `${label} (No project loaded)` : undefined}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap">
        {label}
      </span>
    </motion.button>
  );
};

export default SidebarItem;