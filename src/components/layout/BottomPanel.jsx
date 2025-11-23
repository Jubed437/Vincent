import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, FileText, X, Maximize2, Minimize2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';

const BottomPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [panelHeight, setPanelHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const terminalRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newHeight = Math.max(100, Math.min(600, window.innerHeight - e.clientY));
    setPanelHeight(newHeight);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);
  
  const { 
    activePanel, 
    setActivePanel, 
    terminalOutput, 
    clearTerminalOutput 
  } = useAppStore();

  const tabs = [
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'logs', label: 'Logs', icon: FileText }
  ];

  // Auto-scroll terminal to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  if (!isVisible) {
    return (
      <div className="h-8 bg-vscode-panel border-t border-vscode-border flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="text-xs"
        >
          Show Terminal
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="h-1 bg-transparent hover:bg-vscode-accent cursor-row-resize transition-colors"
        onMouseDown={handleMouseDown}
      />
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 400 : panelHeight }}
        transition={{ duration: 0.2 }}
        className="bg-vscode-panel border-t border-vscode-border flex flex-col"
      >
      {/* Panel Header */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-vscode-border">
        <Tabs
          tabs={tabs}
          activeTab={activePanel}
          onTabChange={setActivePanel}
          className="border-none"
        />
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={isExpanded ? Minimize2 : Maximize2}
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearTerminalOutput}
            className="p-1 text-xs"
          >
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={() => setIsVisible(false)}
            className="p-1"
          />
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activePanel === 'terminal' ? (
          <div
            ref={terminalRef}
            className="h-full p-4 font-mono text-sm text-vscode-text overflow-y-auto scrollbar-thin"
          >
            {terminalOutput.length === 0 ? (
              <div className="text-vscode-text-muted">
                Welcome to Vincent Terminal. Upload a project to get started.
              </div>
            ) : (
              terminalOutput.map((output) => (
                <div key={output.id} className="mb-1 flex gap-2">
                  <span className="text-vscode-text-muted text-xs">
                    {output.timestamp}
                  </span>
                  <span>{output.text}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="h-full p-4 text-vscode-text">
            <div className="text-vscode-text-muted">
              Application logs will appear here...
            </div>
          </div>
        )}
      </div>
      </motion.div>
    </div>
  );
};

export default BottomPanel;