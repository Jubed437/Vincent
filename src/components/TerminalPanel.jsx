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

  const handleStartStop = async () => {
    if (isProjectRunning) {
      // Stop project
      try {
        addTerminalOutput('🛑 Stopping project...');
        const result = await electronAPI.stopProject();
        if (result.success) {
          setProjectRunning(false);
          setServerURL(null);
          addTerminalOutput('✅ Project stopped successfully');
        } else {
          addTerminalOutput(`❌ Failed to stop: ${result.message}`);
        }
      } catch (error) {
        addTerminalOutput(`❌ Error: ${error.message}`);
      }
    } else {
      // Start project
      if (!project?.path) {
        addTerminalOutput('❌ No project loaded. Please upload a project first.');
        return;
      }
      
      try {
        addTerminalOutput('🚀 Starting project...');
        const result = await electronAPI.startProject(project.path);
        
        if (result.success) {
          addTerminalOutput('✅ Project started successfully');
          if (result.data?.url) {
            setServerURL(result.data.url);
          }
          setProjectRunning(true);
        } else {
          addTerminalOutput(`❌ Failed to start: ${result.message}`);
        }
      } catch (error) {
        addTerminalOutput(`❌ Error: ${error.message}`);
      }
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
          <Button
            variant="ghost"
            size="sm"
            icon={isProjectRunning ? Square : Play}
            onClick={handleStartStop}
            className={`text-xs ${isProjectRunning ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
            disabled={!isProjectRunning && !project?.path}
          >
            {isProjectRunning ? 'Stop' : 'Start'}
          </Button>
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
      <div className="flex-1 flex flex-col bg-black min-h-0">
        {/* Terminal Output */}
        <div 
          ref={terminalRef}
          className="flex-1 p-4 overflow-y-auto font-mono text-sm text-green-400 min-h-0"
          style={{ maxHeight: '100%' }}
        >
          {terminalOutput.map((output, index) => {
            const text = output.text || '';
            // Strip ANSI color codes more thoroughly
            const cleanText = text
              .replace(/\x1b\[[0-9;]*m/g, '')
              .replace(/\[\d+m/g, '')
              .replace(/\u001b\[[0-9;]*m/g, '');
            
            // More comprehensive URL regex
            const urlRegex = /(https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?(?:\/[^\s]*)?)/gi;
            const parts = cleanText.split(urlRegex);
            
            return (
              <div key={output.id || index} className="mb-1">
                <span className="text-gray-500 text-xs mr-2">{output.timestamp}</span>
                <span>
                  {parts.map((part, i) => {
                    if (part && part.match(urlRegex)) {
                      return (
                        <span
                          key={i}
                          onClick={() => electronAPI.openExternal(part)}
                          className="text-blue-400 underline cursor-pointer hover:text-blue-300 font-bold"
                        >
                          {part}
                        </span>
                      );
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TerminalPanel;