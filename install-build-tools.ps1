# Run this script as Administrator to install Windows Build Tools
# Required for node-pty compilation

Write-Host "Installing Windows Build Tools..." -ForegroundColor Green
Write-Host "This may take 10-15 minutes..." -ForegroundColor Yellow

# Install windows-build-tools using npm
npm install --global --production windows-build-tools

Write-Host "`nBuild tools installation complete!" -ForegroundColor Green
Write-Host "Now you can run: npm install" -ForegroundColor Cyan
