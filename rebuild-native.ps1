Write-Host "Cleaning up existing modules..." -ForegroundColor Yellow
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "yarn.lock" -Force -ErrorAction SilentlyContinue

Write-Host "Installing dependencies..." -ForegroundColor Yellow
$env:ELECTRON_CACHE = ".electron-cache"
npm install

Write-Host "Rebuilding native modules for Electron..." -ForegroundColor Yellow
npx electron-rebuild -f -w better-sqlite3

Write-Host "Verifying installations..." -ForegroundColor Yellow
node -e "try { require('better-sqlite3'); console.log('✓ better-sqlite3 loaded successfully'); } catch(e) { console.error('✗ Error:', e.message); }"
npx electron --version

Write-Host "Done!" -ForegroundColor Green
Read-Host "Press Enter to continue"