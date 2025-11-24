import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Button from '../ui/Button';
import electronAPI from '../../utils/electronAPI';

const BottomPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [panelHeight, setPanelHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
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

  const createNewTerminal = () => {
    const newId = Math.max(...terminals.map(t => t.id)) + 1;
    setTerminals(prev => [...prev, { id: newId, output: [], currentInput: '' }]);
    setActiveTerminal(newId);
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
          <div className="flex items-center gap-2">
            <TerminalIcon size={16} className="text-gray-400" />
            <span className="text-sm text-gray-300">Terminal</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={createNewTerminal}
              className="p-1 text-xs ml-2"
            >
              +
            </Button>
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
              onClick={() => setTerminals(prev => prev.map(t => 
                t.id === activeTerminal ? { ...t, output: [] } : t
              ))}
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

        {/* Terminal Tabs */}
        <div className="flex bg-gray-800 border-b border-gray-700">
          {terminals.map(terminal => (
            <div
              key={terminal.id}
              className={`px-3 py-1 text-xs cursor-pointer flex items-center gap-2 ${
                activeTerminal === terminal.id ? 'bg-black text-white' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTerminal(terminal.id)}
            >
              Terminal {terminal.id}
              {terminals.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (terminals.length > 1) {
                      setTerminals(prev => prev.filter(t => t.id !== terminal.id));
                      if (activeTerminal === terminal.id) {
                        setActiveTerminal(terminals.find(t => t.id !== terminal.id)?.id || 1);
                      }
                    }
                  }}
                  className="text-gray-500 hover:text-red-400"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Terminal Content */}
        <div 
          ref={outputRef}
          className="flex-1 overflow-y-auto p-3 font-mono text-sm bg-black text-white cursor-text"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={() => inputRef.current?.focus()}
        >
          {output.map((line) => (
            <div 
              key={line.id} 
              className={`whitespace-pre-wrap ${
                line.type === 'error' ? 'text-red-400' : 
                line.type === 'command' ? 'text-white' : 
                line.type === 'system' ? 'text-gray-300' :
                'text-gray-200'
              }`}
            >
              {line.text}
            </div>
          ))}
          
          {/* Current prompt line */}
          <div className="flex items-center">
            <span className="text-blue-400 font-bold">PS {project?.path || 'C:\\'}&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              className="flex-1 bg-transparent text-white outline-none border-none ml-1"
              style={{ caretColor: 'white' }}
              autoFocus
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BottomPanel;