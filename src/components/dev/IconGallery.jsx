/**
 * Icon Gallery Component - Development Tool
 * Displays all available file icons for testing and documentation
 * Remove or disable in production
 */

import { 
  JavaScriptIcon,
  TypeScriptIcon,
  ReactIcon,
  JsonIcon,
  HtmlIcon,
  CssIcon,
  MarkdownIcon,
  EnvIcon,
  LockIcon,
  GitIcon,
  ImageIcon,
  VideoIcon,
  PdfIcon,
  ConfigIcon,
  TextIcon,
  FolderIcon,
  NpmIcon,
  DockerIcon,
  YamlIcon,
  SqlIcon,
  XmlIcon,
  ShellIcon,
  DefaultFileIcon,
  getFileIcon
} from '../../utils/fileIcons';

const IconGallery = () => {
  const iconDemos = [
    { name: 'JavaScript', component: JavaScriptIcon, files: ['app.js', 'index.mjs', 'utils.cjs'] },
    { name: 'TypeScript', component: TypeScriptIcon, files: ['app.ts', 'types.d.ts'] },
    { name: 'React', component: ReactIcon, files: ['App.jsx', 'Button.tsx'] },
    { name: 'JSON', component: JsonIcon, files: ['config.json', 'data.json5'] },
    { name: 'HTML', component: HtmlIcon, files: ['index.html', 'template.htm'] },
    { name: 'CSS', component: CssIcon, files: ['styles.css', 'main.scss', 'theme.sass'] },
    { name: 'Markdown', component: MarkdownIcon, files: ['README.md', 'docs.mdx'] },
    { name: 'Environment', component: EnvIcon, files: ['.env', '.env.local', '.env.production'] },
    { name: 'Lock', component: LockIcon, files: ['package-lock.json', 'yarn.lock'] },
    { name: 'Git', component: GitIcon, files: ['.gitignore', '.gitattributes'] },
    { name: 'Image', component: ImageIcon, files: ['logo.png', 'photo.jpg', 'icon.svg'] },
    { name: 'Video', component: VideoIcon, files: ['demo.mp4', 'intro.webm'] },
    { name: 'PDF', component: PdfIcon, files: ['document.pdf'] },
    { name: 'Config', component: ConfigIcon, files: ['vite.config.js', 'tailwind.config.js'] },
    { name: 'Text', component: TextIcon, files: ['notes.txt', 'log.log'] },
    { name: 'NPM', component: NpmIcon, files: ['package.json'] },
    { name: 'Docker', component: DockerIcon, files: ['Dockerfile', '.dockerignore'] },
    { name: 'YAML', component: YamlIcon, files: ['config.yml', 'data.yaml'] },
    { name: 'SQL', component: SqlIcon, files: ['schema.sql', 'database.sqlite'] },
    { name: 'XML', component: XmlIcon, files: ['config.xml', 'data.xml'] },
    { name: 'Shell', component: ShellIcon, files: ['script.sh', 'start.bat', 'deploy.ps1'] },
    { name: 'Default', component: DefaultFileIcon, files: ['unknown.xyz'] },
  ];

  const folderDemo = [
    { name: 'Closed Folder', isOpen: false },
    { name: 'Open Folder', isOpen: true },
  ];

  return (
    <div className="p-6 bg-vscode-bg text-vscode-text min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Vincent File Icon Gallery</h1>
        <p className="text-vscode-text-muted mb-8">
          Complete collection of file type icons used in the File Explorer
        </p>

        {/* Folder Icons */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Folder Icons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folderDemo.map((folder) => (
              <div 
                key={folder.name}
                className="bg-vscode-sidebar p-4 rounded-lg border border-vscode-border"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FolderIcon size={32} isOpen={folder.isOpen} />
                  <span className="font-medium">{folder.name}</span>
                </div>
                <code className="text-xs text-vscode-text-muted">
                  isOpen={folder.isOpen.toString()}
                </code>
              </div>
            ))}
          </div>
        </section>

        {/* File Type Icons */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">File Type Icons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {iconDemos.map(({ name, component: Icon, files }) => (
              <div 
                key={name}
                className="bg-vscode-sidebar p-4 rounded-lg border border-vscode-border"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon size={32} />
                  <span className="font-medium text-lg">{name}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-vscode-text-muted font-semibold">Example files:</p>
                  {files.map((file) => {
                    const FileIcon = getFileIcon(file, 'file');
                    return (
                      <div 
                        key={file}
                        className="flex items-center gap-2 text-sm bg-vscode-bg px-2 py-1 rounded"
                      >
                        <FileIcon size={16} />
                        <code className="text-vscode-text">{file}</code>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Real-world Example */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Real-world Project Structure Example</h2>
          <div className="bg-vscode-sidebar p-6 rounded-lg border border-vscode-border max-w-2xl">
            <div className="space-y-1 font-mono text-sm">
              {[
                { name: 'src', type: 'folder', level: 0 },
                { name: 'App.jsx', type: 'file', level: 1 },
                { name: 'main.js', type: 'file', level: 1 },
                { name: 'components', type: 'folder', level: 1 },
                { name: 'Button.tsx', type: 'file', level: 2 },
                { name: 'Header.jsx', type: 'file', level: 2 },
                { name: 'styles', type: 'folder', level: 1 },
                { name: 'index.css', type: 'file', level: 2 },
                { name: 'tailwind.css', type: 'file', level: 2 },
                { name: 'public', type: 'folder', level: 0 },
                { name: 'logo.png', type: 'file', level: 1 },
                { name: 'favicon.svg', type: 'file', level: 1 },
                { name: 'package.json', type: 'file', level: 0 },
                { name: 'vite.config.js', type: 'file', level: 0 },
                { name: 'tailwind.config.js', type: 'file', level: 0 },
                { name: '.env', type: 'file', level: 0 },
                { name: '.gitignore', type: 'file', level: 0 },
                { name: 'README.md', type: 'file', level: 0 },
                { name: 'Dockerfile', type: 'file', level: 0 },
              ].map((item, idx) => {
                const IconComponent = getFileIcon(item.name, item.type, false);
                return (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 hover:bg-vscode-hover px-2 py-1 rounded"
                    style={{ paddingLeft: `${8 + item.level * 16}px` }}
                  >
                    <IconComponent size={16} />
                    <span className="text-vscode-text">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Usage Instructions */}
        <section className="mt-12 bg-vscode-panel p-6 rounded-lg border border-vscode-border">
          <h2 className="text-2xl font-semibold mb-4">Usage Instructions</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-vscode-accent mb-2">Basic Usage:</h3>
              <pre className="bg-vscode-bg p-3 rounded overflow-x-auto">
{`import { getFileIcon } from '../../utils/fileIcons';

// Get icon for a file
const FileIcon = getFileIcon('app.js', 'file');

// Get icon for a folder
const FolderIcon = getFileIcon('components', 'folder', isExpanded);

// Render the icon
<FileIcon size={16} className="text-blue-400" />`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold text-vscode-accent mb-2">Icon Sizing:</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <JavaScriptIcon size={12} />
                  <span>12px (small)</span>
                </div>
                <div className="flex items-center gap-2">
                  <JavaScriptIcon size={16} />
                  <span>16px (default)</span>
                </div>
                <div className="flex items-center gap-2">
                  <JavaScriptIcon size={20} />
                  <span>20px (medium)</span>
                </div>
                <div className="flex items-center gap-2">
                  <JavaScriptIcon size={32} />
                  <span>32px (large)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IconGallery;
