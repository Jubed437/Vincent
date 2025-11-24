@echo off
echo Cleaning up existing modules...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
del yarn.lock 2>nul

echo Installing dependencies...
set ELECTRON_CACHE=.electron-cache
npm install

echo Rebuilding native modules for Electron...
npx electron-rebuild -f -w better-sqlite3

echo Verifying installations...
node -e "try { require('better-sqlite3'); console.log('✓ better-sqlite3 loaded successfully'); } catch(e) { console.error('✗ Error:', e.message); }"
npx electron --version

echo Done!
pause