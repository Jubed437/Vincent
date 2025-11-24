@echo off
echo Starting Vincent...
set NODE_ENV=development
start /B npm run dev
timeout /t 5 /nobreak >nul
electron .