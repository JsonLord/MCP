import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import worker from './index.js'

const app = new Hono()

// Health check
app.get('/health', (c) => c.text('OK'))

// API Docs - Simple HTML page listing endpoints
app.get('/api-docs', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jina MCP Server API Docs</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        .endpoint { background: #f4f4f4; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .method { font-weight: bold; color: #0056b3; }
        .path { font-family: monospace; background: #e0e0e0; padding: 2px 5px; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Jina MCP Server API Documentation</h1>
    <p>This server implements the Model Context Protocol (MCP) for Jina AI tools.</p>

    <div class="endpoint">
        <span class="method">GET</span> <span class="path">/</span>
        <p>Returns server information and available tools in YAML format.</p>
    </div>

    <div class="endpoint">
        <span class="method">GET/POST</span> <span class="path">/v1</span>
        <p>MCP Protocol Endpoint. Handles JSON-RPC messages.</p>
    </div>

    <div class="endpoint">
        <span class="method">GET</span> <span class="path">/sse</span>
        <p>Server-Sent Events endpoint for MCP.</p>
    </div>

    <div class="endpoint">
        <span class="method">GET</span> <span class="path">/health</span>
        <p>Health check endpoint. Returns "OK".</p>
    </div>

    <h2>Tools Available</h2>
    <ul>
        <li>search_web</li>
        <li>search_arxiv</li>
        <li>search_ssrn</li>
        <li>search_images</li>
        <li>read_url</li>
        <li>capture_screenshot_url</li>
        <li>guess_datetime_url</li>
        <li>search_jina_blog</li>
        <li>search_bibtex</li>
        <li>expand_query</li>
        <li>parallel_search_web</li>
        <li>parallel_search_arxiv</li>
        <li>parallel_search_ssrn</li>
        <li>parallel_read_url</li>
        <li>sort_by_relevance</li>
        <li>deduplicate_strings</li>
        <li>deduplicate_images</li>
        <li>extract_pdf</li>
    </ul>
</body>
</html>
  `)
})

// Forward everything else to the worker
app.all('*', async (c) => {
   const env = {
       JINA_API_KEY: process.env.JINA_API_KEY,
       VITE_GHOST_API_KEY: process.env.VITE_GHOST_API_KEY,
       API_BASE_URL: process.env.API_BASE_URL || 'https://api.jina.ai'
   };

   const ctx = {
       waitUntil: (promise: Promise<any>) => {
           // In a real worker, this keeps the worker alive.
           // In Node, we just let it run in background but catch errors.
           promise.catch(console.error);
       },
       passThroughOnException: () => {},
       props: {}
   };

   // Mock CF object
   const request = c.req.raw as any;

   // Create a dummy CF object
   const cf = {
       timezone: 'UTC',
       country: 'US',
       city: 'Unknown',
       region: 'Unknown',
       regionCode: 'Unknown',
       continent: 'NA',
       postalCode: '00000',
       metroCode: '0',
       latitude: '0',
       longitude: '0',
       isEUCountry: '0',
       asn: 0,
       asOrganization: 'Unknown',
       colo: 'Unknown',
       httpProtocol: 'HTTP/1.1',
       tlsVersion: 'TLSv1.3'
   };

   // Monkey-patch cf onto request if not present
   if (!request.cf) {
       Object.defineProperty(request, 'cf', { value: cf });
   }

   return await worker.fetch(request, env as any, ctx);
})

const port = 7860
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
