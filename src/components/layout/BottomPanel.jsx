import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, FileText } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Button from '../ui/Button';
import TerminalPanel from '../TerminalPanel';
import electronAPI from '../../utils/electronAPI';

const BottomPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [panelHeight, setPanelHeight] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('output');
  const [terminals, setTerminals] = useState([{ id: 1, output: [], currentInput: '' }]);
  const [activeTerminal, setActiveTerminal] = useState(1);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  const currentTerminal = terminals.find(t => t.id === activeTerminal);
  const output = currentTerminal?.output || [];
  const currentInput = currentTerminal?.currentInput || '';

  const setCurrentInput = (value) => {
    setTerminals(prev => prev.map(t => 
      t.id === activeTerminal ? { ...t, currentInput: value } : t
    ));
  };

  const createNewTerminal = async () => {
    try {
      const result = await electronAPI.createTerminal();
      if (result.success) {
        const { addTerminalOutput } = useAppStore.getState();
        addTerminalOutput(`New terminal created: ${result.data.terminalId}`);
      }
    } catch (error) {
      console.error('Failed to create terminal:', error);
    }
  };

  const { project } = useAppStore();

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

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const addOutput = (text, type = 'output') => {
    setTerminals(prev => prev.map(t => 
      t.id === activeTerminal ? { 
        ...t, 
        output: [...t.output, { id: Date.now() + Math.random(), text, type }] 
      } : t
    ));
  };

  const executeCommand = async (command) => {
    if (!command.trim()) return;

    const workingDir = project?.path || 'C:\\';
    addOutput(`PS ${workingDir}> ${command}`, 'command');

    // Handle clear command locally
    if (command.trim().toLowerCase() === 'clear' || command.trim().toLowerCase() === 'cls') {
      setTerminals(prev => prev.map(t => 
        t.id === activeTerminal ? { ...t, output: [] } : t
      ));
      return;
    }

    // Basic command sanitization
    const sanitizedCommand = command.trim();
    if (sanitizedCommand.includes('&&') || sanitizedCommand.includes('||') || sanitizedCommand.includes(';')) {
      addOutput('Command contains potentially unsafe operators', 'error');
      return;
    }

    try {
      const result = await electronAPI.terminalInput(sanitizedCommand);
      if (result.success) {
        if (result.output) {
          addOutput(result.output, 'output');
        }
      } else {
        addOutput(result.message || 'Command failed', 'error');
      }
    } catch (error) {
      addOutput(`Error: ${error.message}`, 'error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentInput.trim()) {
        executeCommand(currentInput);
        setCurrentInput('');
      }
    }
  };

  useEffect(() => {
    // Add initial welcome message
    addOutput('Windows PowerShell', 'system');
    addOutput('Copyright (C) Microsoft Corporation. All rights reserved.', 'system');
    addOutput('', 'system');
  }, []);

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
        className="bg-black border-t border-gray-800 flex flex-col"
      >
        {/* Panel Header */}
        <div className="h-10 flex items-center justify-between px-4 border-b border-gray-800 bg-[#252526]">
          <div className="flex items-center gap-4">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('output')}
                className={`flex items-center gap-2 px-3 py-1 text-sm rounded transition-colors ${
                  activeTab === 'output' 
                    ? 'bg-vscode-accent text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <FileText size={14} />
                Output
              </button>
              <button
                onClick={() => setActiveTab('terminal')}
                className={`flex items-center gap-2 px-3 py-1 text-sm rounded transition-colors ${
                  activeTab === 'terminal' 
                    ? 'bg-vscode-accent text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <TerminalIcon size={14} />
                Terminal
              </button>
            </div>
            
            {activeTab === 'terminal' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={createNewTerminal}
                className="p-1 text-xs"
              >
                + New Terminal
              </Button>
            )}
          </div>
          
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
              icon={X}
              onClick={() => setIsVisible(false)}
              className="p-1"
            />
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-hidden">
          <TerminalPanel />
        </div>
      </motion.div>
    </div>
  );
};

export default BottomPanel;