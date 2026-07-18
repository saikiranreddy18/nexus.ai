// Single-task mode: the boss hands the company ONE piece of work, the CEO
// routes it to the right specialist, and that specialist executes it.
//
//   routeAndRun("write a cold email for dentists")
//     → { assignee: "Sales Expert", reason: "...", result: "<deliverable>" }
//
// Routing is done by the CEO agent (a tiny, cheap LLM call). If that call
// fails for any reason, a keyword fallback keeps the office working.

import { AGENTS, AGENT_LIST } from "./agents.js";
import { callAgent } from "./llm.js";

// Keyword fallback so a routing-call failure never dead-ends the task.
const KEYWORDS = {
  market: ["market", "competitor", "pricing", "persona", "positioning", "research", "swot", "trend"],
  content: ["copy", "landing", "blog", "post", "instagram", "reel", "email campaign", "newsletter", "content", "caption", "script", "ad "],
  sales: ["cold email", "outreach", "sales", "lead", "objection", "close", "proposal", "linkedin", "crm", "pitch"],
  developer: ["code", "bug", "api", "architecture", "database", "app", "build", "deploy", "frontend", "backend", "security"],
  data: ["metric", "kpi", "dashboard", "funnel", "churn", "forecast", "analytics", "retention", "revenue report"],
  support: ["faq", "refund", "ticket", "customer support", "complaint", "help center", "knowledge base", "onboarding doc"],
};

function keywordRoute(task) {
  const t = task.toLowerCase();
  let best = { id: "ceo", hits: 0 };
  for (const [id, words] of Object.entries(KEYWORDS)) {
    const hits = words.filter((w) => t.includes(w)).length;
    if (hits > best.hits) best = { id, hits };
  }
  return best.id; // ceo handles anything nothing else claims
}

/** Ask the CEO which specialist should own this task. */
export async function routeTask(task) {
  const roster = AGENT_LIST.map((a) => `- ${a.id}: ${a.name}`).join("\n");
  try {
    const raw = await callAgent({
      system:
        "You are the CEO of this company. You assign incoming work to the right team member. " +
        "Reply with ONLY a JSON object, no markdown fence, in the form " +
        '{"agent":"<id>","reason":"<one short sentence>"}.',
      prompt: `Team roster (id: role):\n${roster}\n\nIncoming task:\n"""${task}"""\n\nWhich ONE agent should own this? JSON only.`,
      maxTokens: 200,
    });
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : raw);
    if (AGENTS[parsed.agent]) {
      return { agentId: parsed.agent, reason: parsed.reason || "CEO's call", via: "ceo" };
    }
    throw new Error(`unknown agent id "${parsed.agent}"`);
  } catch {
    const agentId = keywordRoute(task);
    return { agentId, reason: "Routed by keyword match (CEO routing unavailable)", via: "fallback" };
  }
}

/**
 * Route a task to the right agent and execute it.
 * @param {string} task
 * @param {(evt: {stage: string, agent: string, status: string}) => void} [onProgress]
 */
export async function routeAndRun(task, onProgress = () => {}) {
  if (!task || !task.trim()) throw new Error("A task is required.");
  task = task.trim();

  // 1. CEO decides who owns it
  onProgress({ stage: "1/2 · Routing", agent: AGENTS.ceo.name, status: "start" });
  const route = await routeTask(task);
  const agent = AGENTS[route.agentId];
  onProgress({ stage: "1/2 · Routing", agent: AGENTS.ceo.name, status: "done" });

  // 2. The specialist executes
  onProgress({ stage: "2/2 · Working", agent: agent.name, status: "start" });
  let result, status = "done";
  try {
    result = await callAgent({
      system: agent.system,
      prompt:
        `The CEO has assigned you this task:\n"""${task}"""\n\n` +
        `Complete it fully and hand back a finished, usable deliverable — ` +
        `not an outline of what you would do. Apply your standards and frameworks.`,
    });
  } catch (err) {
    result = `> ⚠️ ${agent.name} failed: ${err.message}`;
    status = "error";
  }
  onProgress({ stage: "2/2 · Working", agent: agent.name, status });

  return { task, assignee: agent.name, assigneeId: agent.id, reason: route.reason, via: route.via, result };
}
