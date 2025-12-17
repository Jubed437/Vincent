@echo off
echo Installing Vincent Terminal Dependencies...
echo.

echo Installing xterm.js and WebSocket dependencies...
npm install xterm xterm-addon-fit xterm-addon-web-links ws express cors

echo.
echo Checking for node-pty...
npm list node-pty >nul 2>&1
if %errorlevel% neq 0 (
    echo node-pty not found, installing...
    npm install node-pty
) else (
    echo node-pty already installed, rebuilding...
    npm rebuild node-pty
)

echo.
echo Installation complete!
echo.
echo To start Vincent:
echo 1. npm start
echo 2. npm run electron-dev
echo.
pause