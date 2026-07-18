import https from 'https';
import http from 'http';

// Simple .env parser — no dependencies
function loadEnv(path) {
  try {
    const fs = require('fs');
    const content = fs.readFileSync(path, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([^=\s]+)\s*=\s*(.*)/);
      if (match) env[match[1]] = match[2].trim();
    });
    return env;
  } catch {
    return {};
  }
}

const envConfig = { ...loadEnv('.env'), ...process.env };

async function callLLM(systemPrompt, userMessage, model = null) {
  const selectedModel = model || envConfig.ORACLE_MODEL || 'meta/llama-3.1-8b-instruct';

  if (envConfig.OPENROUTER_API_KEY) {
    return callOpenRouter(systemPrompt, userMessage, selectedModel);
  }
  if (envConfig.ANTHROPIC_API_KEY) {
    return callAnthropic(systemPrompt, userMessage, selectedModel);
  }
  if (envConfig.OPENAI_API_KEY) {
    return callOpenAI(systemPrompt, userMessage, selectedModel);
  }
  if (envConfig.NVIDIA_API_KEY) {
    return callNvidia(systemPrompt, userMessage, selectedModel);
  }

  throw new Error('No LLM API key configured');
}

async function callOpenRouter(systemPrompt, userMessage, model) {
  const options = {
    hostname: 'openrouter.ai',
    port: 443,
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \Bearer \{envConfig.OPENROUTER_API_KEY}\,
      'HTTP-Referer': 'https://startup-oracle.local',
    }
  };

  const payload = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
  };

  return httpRequest(options, payload);
}

async function callAnthropic(systemPrompt, userMessage, model) {
  const options = {
    hostname: 'api.anthropic.com',
    port: 443,
    path: '/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': envConfig.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    }
  };

  const payload = {
    model: model || 'claude-3-sonnet-20240229',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }]
  };

  const response = await httpRequest(options, payload);
  if (response.content && response.content[0] && response.content[0].text) {
    return response.content[0].text;
  }
  return response.choices?.[0]?.message?.content || '';
}

async function callOpenAI(systemPrompt, userMessage, model) {
  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \Bearer \{envConfig.OPENAI_API_KEY}\,
    }
  };

  const payload = {
    model: model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
  };

  const response = await httpRequest(options, payload);
  return response.choices[0].message.content;
}

async function callNvidia(systemPrompt, userMessage, model) {
  const nvidiaModel = model || 'meta/llama-3.1-8b-instruct';
  const options = {
    hostname: 'integrate.api.nvidia.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \Bearer \{envConfig.NVIDIA_API_KEY}\,
    }
  };

  const payload = {
    model: nvidiaModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    top_p: 0.7,
    max_tokens: 1024,
  };

  const response = await httpRequest(options, payload);
  return response.choices[0].message.content;
}

function httpRequest(options, payload) {
  return new Promise((resolve, reject) => {
    const protocol = options.port === 443 ? https : http;
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(\API error (\{res.statusCode}): \{data}\));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(\Failed to parse response: \{data}\));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

export { callLLM, envConfig };
