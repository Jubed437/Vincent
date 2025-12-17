#!/bin/bash

echo "Installing Vincent Terminal Dependencies..."
echo

echo "Installing xterm.js and WebSocket dependencies..."
npm install xterm xterm-addon-fit xterm-addon-web-links ws express cors

echo
echo "Checking for node-pty..."
if npm list node-pty >/dev/null 2>&1; then
    echo "node-pty already installed, rebuilding..."
    npm rebuild node-pty
else
    echo "node-pty not found, installing..."
    npm install node-pty
fi

echo
echo "Installation complete!"
echo
echo "To start Vincent:"
echo "1. npm start"
echo "2. npm run electron-dev"
echo