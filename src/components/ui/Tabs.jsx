import { motion } from 'framer-motion';

const Tabs = ({ tabs, activeTab, onTabChange, className = '' }) => {
  return (
    <div className={`border-b border-vscode-border ${className}`}>
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              tab.disabled
                ? 'text-vscode-text-muted opacity-50 cursor-not-allowed'
                : activeTab === tab.id
                ? 'text-vscode-text'
                : 'text-vscode-text-muted hover:text-vscode-text'
            } ${tab.className || ''}`}
          >
            <div className="flex items-center gap-2">
              {tab.icon && <tab.icon size={16} />}
              {tab.label}
            </div>
            
            {activeTab === tab.id && !tab.disabled && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-vscode-accent"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;