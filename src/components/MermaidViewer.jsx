import { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import Button from './ui/Button';

const MermaidViewer = ({ data }) => {
  const [zoom, setZoom] = useState(1);

  const renderNode = (item, index, total) => {
    const colors = {
      start: 'from-green-500 to-green-600',
      tech: 'from-blue-500 to-blue-600',
      dep: 'from-purple-500 to-purple-600',
      api: 'from-cyan-500 to-cyan-600',
      db: 'from-pink-500 to-pink-600',
      end: 'from-green-500 to-green-600'
    };

    return (
      <div
        key={index}
        className="flex flex-col items-center"
        style={{
          animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
        }}
      >
        <div className={`px-6 py-4 rounded-xl bg-gradient-to-br ${colors[item.type] || colors.tech} shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <div className="text-white font-bold text-lg">{item.title}</div>
              {item.subtitle && <div className="text-white/80 text-sm">{item.subtitle}</div>}
            </div>
          </div>
        </div>
        {index < total - 1 && (
          <div className="h-12 w-1 bg-gradient-to-b from-gray-600 to-gray-700 my-2 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white text-lg font-bold">Project Flow Diagram</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={ZoomOut}
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="text-white hover:bg-white/10"
          />
          <span className="text-white text-sm font-mono">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="sm"
            icon={ZoomIn}
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="text-white hover:bg-white/10"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Maximize2}
            onClick={() => setZoom(1)}
            className="text-white hover:bg-white/10"
          />
        </div>
      </div>

      {/* Diagram Area */}
      <div className="flex-1 overflow-auto p-8">
        <div 
          className="flex flex-col items-center justify-center min-h-full"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'center top',
            transition: 'transform 0.3s ease'
          }}
        >
          {data && data.map((item, index) => renderNode(item, index, data.length))}
        </div>
      </div>
    </div>
  );
};

export default MermaidViewer;

