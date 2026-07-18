import http from 'http';
import url from 'url';
import path from 'path';
import fs from 'fs';
import { retrieve, loadCases } from './src/retrieval.js';
import { buildPrompt } from './src/brain.js';
import { callLLM } from './src/llm.js';

const PORT = process.env.PORT || 4100;

async function parseRequest(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const parsedUrl = url.parse(req.url, true);
        resolve({
          pathname: parsedUrl.pathname,
          query: parsedUrl.query,
          body: body ? JSON.parse(body) : {}
        });
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data, null, 2));
}

function serveFile(res, filePath, mimeType = 'text/html') {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  try {
    const { pathname, query, body } = await parseRequest(req);

    if (pathname === '/api/stats') {
      const cases = loadCases();
      const outcomes = cases.reduce((acc, c) => {
        acc[c.outcome] = (acc[c.outcome] || 0) + 1;
        return acc;
      }, {});
      return sendJSON(res, 200, { totalCases: cases.length, outcomes });
    }

    if (pathname === '/api/search') {
      const q = query.q || body.q || '';
      if (!q) return sendJSON(res, 400, { error: 'Missing query parameter: q' });
      const results = retrieve(q, { limit: parseInt(query.limit || '24') });
      return sendJSON(res, 200, { query: q, results, count: results.length });
    }

    if (pathname === '/api/advise') {
      const q = query.q || body.q || '';
      if (!q) return sendJSON(res, 400, { error: 'Missing query parameter: q' });
      const cases = retrieve(q, { limit: 24 });
      const { systemPrompt, userMessage } = buildPrompt(q, cases);
      try {
        const answer = await callLLM(systemPrompt, userMessage);
        return sendJSON(res, 200, { query: q, answer, caseCount: cases.length, cases });
      } catch (e) {
        return sendJSON(res, 500, { error: \LLM error: \\ });
      }
    }

    if (pathname === '/' || pathname === '/index.html') {
      return serveFile(res, './public/index.html');
    }

    sendJSON(res, 404, { error: 'Not found' });
  } catch (e) {
    console.error('Request error:', e);
    sendJSON(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(\Startup Oracle running on http://localhost:\\);
  console.log(\  /api/stats — dataset info\);
  console.log(\  /api/search?q=... — retrieval only\);
  console.log(\  /api/advise?q=... — full analysis with LLM\);
});
