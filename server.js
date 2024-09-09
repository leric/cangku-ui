import { createServer } from 'http';
import { handler } from './build/handler.js';
import httpProxy from 'http-proxy';

const PORT = process.env.PORT || 3000;
const API_SERVER = process.env.API_SERVER || 'http://localhost:8000';

const proxy = httpProxy.createProxyServer({});

createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    // Remove the /api prefix before proxying
    const originalUrl = req.url;
    req.url = originalUrl.replace(/^\/api/, '');

    // Proxy requests to /api/* to the Python API backend
    proxy.web(req, res, { target: API_SERVER });
  } else {
    // Handle all other requests with the SvelteKit handler
    handler(req, res);
  }
}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
