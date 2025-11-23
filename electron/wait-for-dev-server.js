const http = require('http');

function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function check() {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          console.log('Dev server is ready!');
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    }
    
    function retry() {
      if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for dev server'));
        return;
      }
      setTimeout(check, 1000);
    }
    
    check();
  });
}

waitForServer('http://localhost:5173')
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });