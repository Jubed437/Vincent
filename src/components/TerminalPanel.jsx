import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, ExternalLink, Copy, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import Button from './ui/Button';
import electronAPI from '../utils/electronAPI';

const TerminalPanel = () => {
  const [terminalLines, setTerminalLines] = useState([]);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const terminalRef = useRef(null);
  const { project, isProjectRunning, serverURL, setProjectRunning, setServerURL } = useAppStore();

  // Clean ANSI codes and detect URLs
  const cleanText = (text) => {
    return text.replace(/\u001b\[.*?m/g, '').trim();
  };

  const detectURL = (text) => {
    const urlRegex = /(https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):\d+\/?)/i;
    return text.match(urlRegex)?.[1];
  };

  const renderTextWithLinks = (text) => {
    const cleanedText = cleanText(text);
    const urlRegex = /(https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):\d+\/?)/gi;
    
    const parts = cleanedText.split(urlRegex);
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline hover:text-blue-300 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              electronAPI.openExternal(part);
            }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (isAutoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines, isAutoScroll]);

  // Listen for terminal output
  useEffect(() => {
    const unsubscribeOutput = electronAPI.onTerminalOutput((data) => {
      const text = data.text || data;
      const cleanedText = cleanText(text);
      const detectedURL = detectURL(cleanedText);
      
      const newLine = {
        id: Date.now() + Math.random(),
        text: cleanedText,
        timestamp: data.timestamp || new Date().toISOString(),
        type: data.type || 'output',
        hasURL: !!detectedURL
      };
      
      setTerminalLines(prev => [...prev, newLine]);
    });

    const unsubscribeUrl = electronAPI.onProjectURL((url) => {
      setServerURL(url);
      const urlLine = {
        id: Date.now() + Math.random(),
        text: `🌐 Server available at: ${url}`,
        timestamp: new Date().toISOString(),
        type: 'success',
        hasURL: true
      };
      setTerminalLines(prev => [...prev, urlLine]);
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeUrl?.();
    };
  }, [setServerURL]);

  // Handle scroll detection for auto-scroll toggle
  const handleScroll = () => {
    if (terminalRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAutoScroll(isAtBottom);
    }
  };

  const clearTerminal = () => {
    setTerminalLines([]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const openUrl = (url) => {
    electronAPI.openExternal?.(url) || window.open(url, '_blank');
  };

  const getLineColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-gray-400" />
          <span className="text-sm text-gray-300">Terminal</span>
          {isProjectRunning && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Running</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
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
      <div 
        ref={terminalRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 font-mono text-sm space-y-1"
      >
        {terminalLines.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <TerminalIcon size={48} className="mx-auto mb-2 opacity-50" />
            <p>Terminal output will appear here</p>
            <p className="text-xs mt-1">Start a project to see live logs</p>
          </div>
        ) : (
          terminalLines.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 group"
            >
              <span className="text-xs text-gray-500 font-mono min-w-[60px]">
                {formatTimestamp(line.timestamp)}
              </span>
              <div className={`flex-1 whitespace-pre-wrap break-words ${getLineColor(line.type)}`}>
                {line.hasURL ? renderTextWithLinks(line.text) : line.text}
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={Copy}
                onClick={() => copyToClipboard(line.text)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Auto-scroll indicator */}
      {!isAutoScroll && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 right-4"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsAutoScroll(true);
              if (terminalRef.current) {
                terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
              }
            }}
            className="text-xs shadow-lg"
          >
            Scroll to bottom
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default TerminalPanel;