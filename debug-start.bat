@echo off
echo Starting Vincent in debug mode...
echo.

echo Step 1: Checking Node.js version...
node --version
echo.

echo Step 2: Checking npm version...
npm --version
echo.

echo Step 3: Installing dependencies (if needed)...
npm install
echo.

echo Step 4: Starting Vite dev server...
start "Vite Dev Server" cmd /k "npm run dev"

echo Step 5: Waiting for dev server to be ready...
timeout /t 5 /nobreak > nul

echo Step 6: Starting Electron...
npm run electron

pause