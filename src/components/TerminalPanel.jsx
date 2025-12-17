import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, ExternalLink, Copy, Trash2, Play, Square } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import Button from './ui/Button';
import electronAPI from '../utils/electronAPI';

const TerminalPanel = () => {
  const [command, setCommand] = useState('');
  const terminalRef = useRef(null);
  const { project, isProjectRunning, serverURL, terminalOutput, setProjectRunning, setServerURL, addTerminalOutput, clearTerminalOutput } = useAppStore();

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const executeCommand = async (cmd) => {
    if (!cmd.trim()) return;
    
    addTerminalOutput(`$ ${cmd}`);
    
    try {
      const result = await electronAPI.executeTerminalCommand(cmd, project?.path);
      if (result.success) {
        addTerminalOutput(result.output || 'Command executed successfully');
      } else {
        addTerminalOutput(`Error: ${result.message}`);
      }
    } catch (error) {
      addTerminalOutput(`Error: ${error.message}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      executeCommand(command);
      setCommand('');
    }
  };

  const clearTerminal = () => {
    clearTerminalOutput();
  };

  const startProject = async () => {
    if (!project?.path) {
      addTerminalOutput('No project loaded. Please upload a project first.');
      return;
    }
    
    try {
      addTerminalOutput('Starting project...');
      addTerminalOutput(`Project path: ${project.path}`);
      
      const result = await electronAPI.startProject(project.path);
      
      if (!result.success) {
        addTerminalOutput(`Failed to start: ${result.message}`);
      } else {
        addTerminalOutput('Project started successfully');
        setProjectRunning(true);
        
        // Check for server URL in output
        if (result.output && result.output.includes('localhost')) {
          const urlMatch = result.output.match(/https?:\/\/localhost:\d+/);
          if (urlMatch) {
            setServerURL(urlMatch[0]);
          }
        }
      }
    } catch (error) {
      addTerminalOutput(`Error: ${error.message}`);
    }
  };

  const stopProject = async () => {
    try {
      const result = await electronAPI.stopProject();
      if (result.success) {
        addTerminalOutput('Project stopped');
        setProjectRunning(false);
        setServerURL(null);
      }
    } catch (error) {
      addTerminalOutput(`Failed to stop project: ${error.message}`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-gray-400" />
          <span className="text-sm text-gray-300">Terminal</span>
          {isProjectRunning && (
            <div className="flex items-center gap-1 ml-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Running</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!isProjectRunning ? (
            <Button
              variant="ghost"
              size="sm"
              icon={Play}
              onClick={startProject}
              className="text-xs text-green-400 hover:text-green-300"
              disabled={!project?.path}
            >
              Start
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              icon={Square}
              onClick={stopProject}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Stop
            </Button>
          )}
          {serverURL && (
            <Button
              variant="ghost"
              size="sm"
              icon={ExternalLink}
              onClick={() => electronAPI.openExternal(serverURL)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Open Server
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={clearTerminal}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Server URL Banner */}
      {serverURL && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 bg-green-900/20 border-b border-green-700/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-400">Server Running:</span>
              <a
                href={serverURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 underline hover:text-blue-300 bg-black/30 px-2 py-1 rounded cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  electronAPI.openExternal(serverURL);
                }}
              >
                {serverURL}
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                icon={Copy}
                onClick={() => copyToClipboard(serverURL)}
                className="text-xs"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={ExternalLink}
                onClick={() => electronAPI.openExternal(serverURL)}
                className="text-xs"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Terminal Content */}
      <div className="flex-1 flex flex-col bg-black">
        {/* Terminal Output */}
        <div 
          ref={terminalRef}
          className="flex-1 p-4 overflow-y-scroll font-mono text-sm text-green-400"
          style={{ minHeight: '200px', maxHeight: '400px' }}
        >
          {terminalOutput.map((output, index) => (
            <div key={output.id || index} className="mb-1">
              <span className="text-gray-500 text-xs mr-2">{output.timestamp}</span>
              <span>{output.text}</span>
            </div>
          ))}
        </div>
        
        {/* Terminal Input */}
        <div className="border-t border-gray-700 p-2">
          <div className="flex items-center">
            <span className="text-green-400 mr-2">$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent text-green-400 outline-none font-mono"
              placeholder="Enter command..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalPanel;