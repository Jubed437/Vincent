/**
 * File Icon Registry for Vincent
 * Provides VS Code-style file type icons based on file extensions
 */

// JavaScript Icon
export const JavaScriptIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <rect width="32" height="32" rx="2" fill="#f7df1e"/>
    <text x="16" y="22" fontSize="18" fontWeight="bold" fontFamily="Arial" textAnchor="middle" fill="#000">JS</text>
  </svg>
);

// TypeScript Icon
export const TypeScriptIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <rect width="32" height="32" rx="2" fill="#3178c6"/>
    <text x="16" y="22" fontSize="18" fontWeight="bold" fontFamily="Arial" textAnchor="middle" fill="#fff">TS</text>
  </svg>
);

// React Icon
export const ReactIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="2.2" fill="#61dafb"/>
    <g stroke="#61dafb" strokeWidth="1.8" fill="none">
      <ellipse cx="16" cy="16" rx="11" ry="4.5"/>
      <ellipse cx="16" cy="16" rx="11" ry="4.5" transform="rotate(60 16 16)"/>
      <ellipse cx="16" cy="16" rx="11" ry="4.5" transform="rotate(-60 16 16)"/>
    </g>
  </svg>
);


// JSON Icon
export const JsonIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <rect width="32" height="32" rx="2" fill="#5e5c5c"/>
    <text x="16" y="21" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle" fill="#ffd700">{"{}"}</text>
  </svg>
);

// HTML Icon
export const HtmlIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <path d="M5.902 27.201L3.655 2h24.69l-2.25 25.197L15.985 30z" fill="#e44d26"/>
    <path d="M16 27.858l8.17-2.265 1.922-21.532H16z" fill="#f16529"/>
    <path d="M16 13.407h4.09l.282-3.165H16V7.151h7.75l-.074.83-.759 8.517H16z" fill="#ebebeb"/>
    <path d="M16.019 21.218l-.014.004-3.442-.929-.22-2.465H9.24l.433 4.853 6.331 1.758.015-.004z" fill="#ebebeb"/>
    <path d="M19.827 16.151l-.372 4.16-3.436.926v3.055l6.325-1.753.046-.522.726-8.137H16v3.271h3.479z" fill="#fff"/>
  </svg>
);

// CSS Icon
export const CssIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <path d="M5.902 27.201L3.655 2h24.69l-2.25 25.197L15.985 30z" fill="#1572b6"/>
    <path d="M16 27.858l8.17-2.265 1.922-21.532H16z" fill="#33a9dc"/>
    <path d="M16 13.191h4.09l.282-3.165H16V6.935h7.75l-.074.83-.759 8.517H16z" fill="#fff"/>
    <path d="M16.019 21.218l-.014.004-3.442-.929-.22-2.465H9.24l.433 4.853 6.331 1.758.015-.004z" fill="#ebebeb"/>
    <path d="M19.827 16.151l-.372 4.16-3.436.926v3.055l6.325-1.753.046-.522.726-8.137H16v3.271h3.479z" fill="#fff"/>
  </svg>
);

// Markdown Icon
export const MarkdownIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <rect width="32" height="32" rx="2" fill="#083fa1"/>
    <path d="M7 10v12l3-3 3 3V10H7zm12 0v12h3l4-5v5h3V10h-3l-4 5v-5h-3z" fill="#fff"/>
  </svg>
);

// Environment/Config Icon
export const EnvIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <rect width="32" height="32" rx="2" fill="#4caf50"/>
    <text x="16" y="22" fontSize="16" fontWeight="bold" fontFamily="Arial" textAnchor="middle" fill="#fff">E</text>
  </svg>
);

// Lock/Package-lock Icon
export const LockIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <rect x="9" y="14" width="14" height="14" rx="1" fill="#ffa726"/>
    <path d="M12 14v-3a4 4 0 0 1 8 0v3" stroke="#fb8c00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="16" cy="21" r="2" fill="#fff"/>
  </svg>
);

// Git Icon
export const GitIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <path d="M29.472 14.753L17.247 2.528a1.8 1.8 0 0 0-2.55 0L12.158 5.067l3.22 3.22a2.141 2.141 0 0 1 2.712 2.73l3.1 3.1a2.143 2.143 0 1 1-1.285 1.21l-2.895-2.895v7.617a2.141 2.141 0 1 1-1.764-.062V12.3a2.146 2.146 0 0 1-1.164-2.814L11.088 6.5 2.528 15.06a1.8 1.8 0 0 0 0 2.55l12.225 12.221a1.8 1.8 0 0 0 2.55 0l12.169-12.169a1.8 1.8 0 0 0 0-2.55" fill="#f03c2e"/>
  </svg>
);

// Image Icon
export const ImageIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <rect x="2" y="6" width="28" height="20" rx="2" fill="#9c27b0"/>
    <circle cx="10" cy="13" r="2.5" fill="#fff"/>
    <path d="M2 22l8-8 5 5 7-7 8 8v4H2z" fill="#fff" opacity="0.8"/>
  </svg>
);

// Video Icon
export const VideoIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <rect x="2" y="6" width="28" height="20" rx="2" fill="#e91e63"/>
    <path d="M12 11l10 5-10 5z" fill="#fff"/>
  </svg>
);

// PDF Icon
export const PdfIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <rect x="4" y="2" width="24" height="28" rx="2" fill="#ff3d3d"/>
    <text x="16" y="20" fontSize="8" fontWeight="bold" fontFamily="Arial" textAnchor="middle" fill="#fff">PDF</text>
  </svg>
);

// Config/Settings Icon
export const ConfigIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="4" fill="#607d8b"/>
    <path d="M16 2c-1.1 0-2 .9-2 2v2.1c-1.5.4-2.9 1.1-4.1 2L7.8 6.4c-.8-.8-2-.8-2.8 0-.8.8-.8 2 0 2.8l1.6 1.6c-.9 1.2-1.6 2.6-2 4.1H2c-1.1 0-2 .9-2 2s.9 2 2 2h2.1c.4 1.5 1.1 2.9 2 4.1l-1.6 1.6c-.8.8-.8 2 0 2.8.8.8 2 .8 2.8 0l1.6-1.6c1.2.9 2.6 1.6 4.1 2V30c0 1.1.9 2 2 2s2-.9 2-2v-2.1c1.5-.4 2.9-1.1 4.1-2l1.6 1.6c.8.8 2 .8 2.8 0 .8-.8.8-2 0-2.8l-1.6-1.6c.9-1.2 1.6-2.6 2-4.1H30c1.1 0 2-.9 2-2s-.9-2-2-2h-2.1c-.4-1.5-1.1-2.9-2-4.1l1.6-1.6c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0l-1.6 1.6c-1.2-.9-2.6-1.6-4.1-2V4c0-1.1-.9-2-2-2z" fill="#9e9e9e"/>
  </svg>
);

// Text/Generic File Icon
export const TextIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <path d="M6 2h14l6 6v20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#90a4ae"/>
    <path d="M20 2v6h6" fill="#cfd8dc"/>
    <rect x="9" y="13" width="14" height="2" rx="1" fill="#fff"/>
    <rect x="9" y="17" width="14" height="2" rx="1" fill="#fff"/>
    <rect x="9" y="21" width="10" height="2" rx="1" fill="#fff"/>
  </svg>
);

// Folder Icons
export const FolderIcon = ({ size = 16, className = '', isOpen = false }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    {isOpen ? (
      <>
        <path d="M27.5 8.5h-11l-2.5-3h-9c-1.1 0-2 .9-2 2v17c0 1.1.9 2 2 2h22c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2z" fill="#90caf9"/>
        <path d="M27.5 8.5h-11l-2.5-3h-9c-1.1 0-2 .9-2 2v2h24.5v-1z" fill="#42a5f5"/>
      </>
    ) : (
      <>
        <path d="M27.5 9.5h-13l-2-3h-9c-1.1 0-2 .9-2 2v15c0 1.1.9 2 2 2h24c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2z" fill="#ffa726"/>
        <path d="M27.5 9.5h-13l-2-3h-9c-1.1 0-2 .9-2 2v1.5h26v-0.5z" fill="#fb8c00"/>
      </>
    )}
  </svg>
);

// NPM Icon
export const NpmIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <rect width="32" height="32" fill="#cb3837"/>
    <rect x="4" y="11" width="24" height="10" fill="#fff"/>
    <path d="M6 13h2v6h2v-6h2v6h2V13h2v8h-2v-6h-2v6H6zm10 0h4v8h-2v-6h-2zm6 0h2v6h2v-6h2v6h2v-8h-8z" fill="#cb3837"/>
  </svg>
);

// Docker Icon
export const DockerIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <path d="M16 10h3v3h-3zm-4 0h3v3h-3zm-4 0h3v3H8zm8-4h3v3h-3zm-4 0h3v3h-3z" fill="#0db7ed"/>
    <path d="M27.3 13.5c-.7-.4-2.3-.6-3.5-.4-.2-1.5-1.4-2.8-2.9-3.2l-.6-.2-.4.5c-.5.8-.8 1.8-.7 2.8.1.7.3 1.3.7 1.9-.5.3-1.2.4-1.8.4H2.7l-.2.7c-.5 2.9.3 5.3 2.3 7.1 1.9 1.7 4.7 2.5 8.3 2.5 7.9 0 13.7-3.6 16.4-10.2 1.1 0 3.4 0 4.6-2.2l.4-.7-1.5-1c-.7-.4-1.6-.6-2.5-.6-.3 0-.7 0-1 .1-.5-1.5-1.6-2.7-3.2-3.5z" fill="#0db7ed"/>
  </svg>
);

// YAML Icon
export const YamlIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <rect width="32" height="32" rx="2" fill="#cb171e"/>
    <text x="16" y="20" fontSize="7" fontWeight="bold" fontFamily="Arial" textAnchor="middle" fill="#fff">YAML</text>
  </svg>
);

// SQL Icon
export const SqlIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <ellipse cx="16" cy="9" rx="12" ry="4" fill="#336791"/>
    <path d="M4 9v6c0 2.2 5.4 4 12 4s12-1.8 12-4V9" fill="#336791" opacity="0.8"/>
    <path d="M4 15v6c0 2.2 5.4 4 12 4s12-1.8 12-4v-6" fill="#336791" opacity="0.6"/>
  </svg>
);

// XML Icon
export const XmlIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <rect width="32" height="32" rx="2" fill="#ff6600"/>
    <text x="16" y="21" fontSize="9" fontWeight="bold" fontFamily="Arial" textAnchor="middle" fill="#fff">XML</text>
  </svg>
);

// Shell Script Icon
export const ShellIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <rect width="32" height="32" rx="2" fill="#4eaa25"/>
    <path d="M8 12l5 4-5 4m7 0h8" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Default/Unknown File Icon
export const DefaultFileIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <path d="M6 2h14l6 6v20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#bdbdbd"/>
    <path d="M20 2v6h6" fill="#e0e0e0"/>
  </svg>
);

/**
 * Extension to icon component mapping
 */
const extensionMap = {
  // JavaScript
  'js': JavaScriptIcon,
  'mjs': JavaScriptIcon,
  'cjs': JavaScriptIcon,
  
  // TypeScript
  'ts': TypeScriptIcon,
  'mts': TypeScriptIcon,
  'cts': TypeScriptIcon,
  
  // React
  'jsx': ReactIcon,
  'tsx': ReactIcon,
  
  // Markup/Styles
  'html': HtmlIcon,
  'htm': HtmlIcon,
  'css': CssIcon,
  'scss': CssIcon,
  'sass': CssIcon,
  'less': CssIcon,
  
  // Data/Config
  'json': JsonIcon,
  'jsonc': JsonIcon,
  'json5': JsonIcon,
  'yaml': YamlIcon,
  'yml': YamlIcon,
  'xml': XmlIcon,
  'toml': ConfigIcon,
  'ini': ConfigIcon,
  
  // Documentation
  'md': MarkdownIcon,
  'markdown': MarkdownIcon,
  'mdx': MarkdownIcon,
  'txt': TextIcon,
  
  // Environment/Config
  'env': EnvIcon,
  'env.local': EnvIcon,
  'env.development': EnvIcon,
  'env.production': EnvIcon,
  'env.test': EnvIcon,
  
  // Package managers
  'lock': LockIcon,
  'package-lock.json': NpmIcon,
  'yarn.lock': LockIcon,
  'pnpm-lock.yaml': LockIcon,
  
  // Git
  'gitignore': GitIcon,
  'gitattributes': GitIcon,
  'gitmodules': GitIcon,
  
  // Images
  'png': ImageIcon,
  'jpg': ImageIcon,
  'jpeg': ImageIcon,
  'gif': ImageIcon,
  'svg': ImageIcon,
  'ico': ImageIcon,
  'webp': ImageIcon,
  'bmp': ImageIcon,
  
  // Video
  'mp4': VideoIcon,
  'avi': VideoIcon,
  'mov': VideoIcon,
  'webm': VideoIcon,
  
  // Documents
  'pdf': PdfIcon,
  
  // Docker
  'dockerfile': DockerIcon,
  'dockerignore': DockerIcon,
  
  // Database
  'sql': SqlIcon,
  'sqlite': SqlIcon,
  'db': SqlIcon,
  
  // Shell
  'sh': ShellIcon,
  'bash': ShellIcon,
  'zsh': ShellIcon,
  'fish': ShellIcon,
  'ps1': ShellIcon,
  'bat': ShellIcon,
  'cmd': ShellIcon,
};

/**
 * Special filename patterns for config files
 */
const configFilePatterns = [
  'vite.config',
  'vitest.config',
  'webpack.config',
  'rollup.config',
  'babel.config',
  'tailwind.config',
  'postcss.config',
  'jest.config',
  'eslint.config',
  'prettier.config',
  'tsconfig',
  'jsconfig',
  'next.config',
  'nuxt.config',
  'svelte.config',
  'astro.config',
];

/**
 * Get the appropriate icon component for a file
 * @param {string} fileName - The full file name
 * @param {string} fileType - 'file' or 'folder'
 * @param {boolean} isOpen - For folders, whether it's expanded
 * @returns {React.Component} The icon component
 */
export const getFileIcon = (fileName, fileType = 'file', isOpen = false) => {
  if (fileType === 'folder') {
    return (props) => <FolderIcon {...props} isOpen={isOpen} />;
  }
  
  const lowerFileName = fileName.toLowerCase();
  
  // Check for exact filename matches (like package.json, dockerfile, etc.)
  if (extensionMap[lowerFileName]) {
    return extensionMap[lowerFileName];
  }
  
  // Check for config file patterns
  for (const pattern of configFilePatterns) {
    if (lowerFileName.includes(pattern)) {
      return ConfigIcon;
    }
  }
  
  // Check for NPM package files
  if (lowerFileName === 'package.json') return NpmIcon;
  if (lowerFileName === 'package-lock.json') return NpmIcon;
  
  // Extract extension (handle multi-dot files)
  const parts = fileName.split('.');
  
  if (parts.length > 1) {
    // Try full compound extension first (e.g., .env.local)
    const compoundExt = parts.slice(-2).join('.');
    if (extensionMap[compoundExt]) {
      return extensionMap[compoundExt];
    }
    
    // Try last extension
    const ext = parts[parts.length - 1].toLowerCase();
    if (extensionMap[ext]) {
      return extensionMap[ext];
    }
  }
  
  // Default file icon
  return DefaultFileIcon;
};

/**
 * Get icon color classes based on file type
 * @param {string} fileName - The file name
 * @param {string} fileType - 'file' or 'folder'
 * @returns {string} Tailwind CSS classes
 */
export const getIconColorClass = (fileName, fileType) => {
  if (fileType === 'folder') {
    return 'text-blue-400';
  }
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  const colorMap = {
    'js': 'text-yellow-400',
    'jsx': 'text-cyan-400',
    'ts': 'text-blue-500',
    'tsx': 'text-blue-400',
    'html': 'text-orange-500',
    'css': 'text-blue-400',
    'json': 'text-yellow-600',
    'md': 'text-blue-300',
  };
  
  return colorMap[ext] || 'text-gray-400';
};
