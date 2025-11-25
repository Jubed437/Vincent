import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FolderOpen, File, X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Card from './ui/Card';
import electronAPI from '../utils/electronAPI';

const UploadModal = () => {
  const [dragActive, setDragActive] = useState(false);
  
  const { 
    showUploadModal, 
    setShowUploadModal,
    loadProject,
    addTerminalOutput
  } = useAppStore();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleUpload(files[0]);
    }
  };

  const handleUpload = async (projectPath) => {
    addTerminalOutput(`📁 Loading project: ${projectPath}`);
  };

  const handleFolderUpload = async () => {
    try {
      const result = await electronAPI.selectProjectFolder();
      if (result.success) {
        await loadProject(result);
        setShowUploadModal(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <Modal
      isOpen={showUploadModal}
      onClose={() => setShowUploadModal(false)}
      title="Upload Project"
      size="lg"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive 
              ? 'border-vscode-accent bg-vscode-accent bg-opacity-10' 
              : 'border-vscode-border hover:border-vscode-accent'
          }`}
          padding="lg"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <motion.div
              animate={{ 
                scale: dragActive ? 1.1 : 1,
                rotate: dragActive ? 5 : 0 
              }}
              className="mx-auto mb-4"
            >
              <Upload size={48} className="text-vscode-accent mx-auto" />
            </motion.div>
            
            <h3 className="text-vscode-text font-medium mb-2">
              Drop your project here
            </h3>
            <p className="text-vscode-text-muted text-sm mb-4">
              Supports ZIP files, folders, or individual project files
            </p>
            
            <div className="flex justify-center gap-3">
              <Button
                variant="primary"
                icon={FolderOpen}
                onClick={handleFolderUpload}
              >
                Select Folder
              </Button>
              
              <label>
                <Button
                  variant="secondary"
                  icon={File}
                  as="span"
                >
                  Select Files
                </Button>
                <input
                  type="file"
                  multiple
                  accept=".zip,.tar,.gz,.js,.jsx,.ts,.tsx,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Supported Formats */}
        <div className="text-center">
          <h4 className="text-vscode-text font-medium mb-2">Supported Formats</h4>
          <div className="flex justify-center gap-4 text-sm text-vscode-text-muted">
            <span>JavaScript</span>
            <span>•</span>
            <span>React</span>
            <span>•</span>
            <span>Node.js</span>
            <span>•</span>
            <span>Express</span>
            <span>•</span>
            <span>ZIP Archives</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UploadModal;