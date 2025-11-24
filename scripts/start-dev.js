const { spawn } = require('child_process');
const waitOn = require('wait-on');

async function startDev() {
  console.log('🚀 Starting Vincent development environment...');
  
  // Start Vite dev server
  console.log('📦 Starting Vite dev server...');
  const viteProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  try {
    // Wait for dev server to be ready
    console.log('⏳ Waiting for dev server to be ready...');
    await waitOn({
      resources: ['http://localhost:5173'],
      delay: 1000,
      interval: 100,
      timeout: 30000
    });
    
    console.log('✅ Dev server is ready!');
    
    // Add a small delay to ensure everything is loaded
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start Electron
    console.log('🖥️  Starting Electron...');
    const electronProcess = spawn('electron', ['.'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    // Handle process cleanup
    const cleanup = () => {
      console.log('\n🛑 Shutting down...');
      viteProcess.kill();
      electronProcess.kill();
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    electronProcess.on('close', () => {
      console.log('Electron closed, shutting down dev server...');
      viteProcess.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start dev server:', error);
    viteProcess.kill();
    process.exit(1);
  }
}

startDev().catch(console.error);