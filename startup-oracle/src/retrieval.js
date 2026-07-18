import fs from 'fs';

let casesCache = null;

function loadCases() {
  if (casesCache) return casesCache;
  try {
    const data = fs.readFileSync('./data/enriched-master.json', 'utf8');
    casesCache = JSON.parse(data);
    casesCache.forEach(c => {
      c._tokens = new Set(tokenize(`${c.name} ${c.industry} ${c.summary} ${(c.causes || []).join(' ')}`));
    });
    return casesCache;
  } catch {
    try {
      const data = fs.readFileSync('./data/cases.json', 'utf8');
      casesCache = JSON.parse(data);
      casesCache.forEach(c => {
        c._tokens = new Set(tokenize(`${c.name} ${c.industry} ${c.summary} ${(c.causes || []).join(' ')}`));
      });
      return casesCache;
    } catch {
      return [];
    }
  }
}

function tokenize(text) {
  return text.toLowerCase().split(/\s+/).map(t => t.replace(/[^\w]/g, '')).filter(t => t.length > 2);
}

function retrievalScore(query, caseObj) {
  const queryTokens = new Set(tokenize(query));
  let score = 0;
  const overlap = [...queryTokens].filter(t => caseObj._tokens.has(t)).length;
  score += overlap * 10;
  if (queryTokens.has(caseObj.industry.toLowerCase())) score += 15;
  const causeTags = (caseObj.causes || []).join(' ').toLowerCase();
  const causeMatches = [...queryTokens].filter(t => causeTags.includes(t)).length;
  score += causeMatches * 5;
  return score;
}

function retrieve(query, { limit = 24 } = {}) {
  const cases = loadCases();
  if (!cases.length) return [];
  const scored = cases.map(c => ({ ...c, _score: retrievalScore(query, c) }));
  scored.sort((a, b) => b._score - a._score);
  return scored.slice(0, limit).map(({ _tokens, _score, ...c }) => c);
}

export { retrieve, loadCases };
