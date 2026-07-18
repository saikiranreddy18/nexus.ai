// The workflow. Takes a raw business idea and runs it through the whole
// startup team automatically, in dependency order, with no human in the loop.
//
// Pipeline (a small DAG):
//
//   idea
//    └─▶ 1. CEO Assistant .............. strategy, OKRs, roadmap, priorities
//         └─▶ 2. Market Research ....... competitors, personas, pricing, positioning
//              └─▶ 3. (parallel, informed by 1 + 2)
//                     ├─ Content Writer ..... landing page + social + email copy
//                     ├─ Sales Expert ....... cold outreach + scripts + sequences
//                     ├─ Developer .......... architecture + tech stack + MVP plan
//                     └─ Data Analyst ....... KPIs + dashboards + forecasting
//                   └─▶ 4. Customer Support .. FAQ + workflows + retention
//                        └─▶ 5. CEO synthesis . consolidated 90-day execution plan
//
// Every stage's output is fed forward as context to the stages that depend on it,
// so the agents genuinely build on each other's work.

import { AGENTS } from "./agents.js";
import { callAgent, getLLMInfo } from "./llm.js";

// Trim long upstream context so downstream prompts stay focused and affordable.
const clip = (text, max = 6000) =>
  text.length > max ? `${text.slice(0, max)}\n\n…[truncated]` : text;

/**
 * Run the full startup team pipeline for a business idea.
 *
 * @param {string} idea                The raw business idea.
 * @param {(evt: {stage: string, agent: string, status: string}) => void} [onProgress]
 * @returns {Promise<{ idea: string, model: string, effort: string, sections: object, blueprint: string }>}
 */
export async function runStartupPipeline(idea, onProgress = () => {}) {
  if (!idea || !idea.trim()) {
    throw new Error("An idea is required.");
  }
  idea = idea.trim();

  const sections = {};

  // Runs one agent, reporting progress and tolerating failure so one dead
  // stage doesn't sink the whole run.
  const step = async (stage, agentId, prompt) => {
    const agent = AGENTS[agentId];
    onProgress({ stage, agent: agent.name, status: "start" });
    try {
      const out = await callAgent({ system: agent.system, prompt });
      sections[agentId] = out;
      onProgress({ stage, agent: agent.name, status: "done" });
      return out;
    } catch (err) {
      const msg = `> ⚠️ ${agent.name} failed: ${err.message}`;
      sections[agentId] = msg;
      onProgress({ stage, agent: agent.name, status: "error" });
      return msg;
    }
  };

  // ── Stage 1: CEO sets strategy from the raw idea ─────────────────────────
  const ceo = await step(
    "1/6 · Strategy",
    "ceo",
    `A founder brings you this idea:\n\n"""${idea}"""\n\n` +
      `Produce the founding strategy brief. Include: one-line positioning; the core problem ` +
      `and target customer; the business model and primary revenue streams; a 3-objective ` +
      `OKR set with measurable key results for the first 90 days; the top 3 growth ` +
      `bottlenecks and how to attack them; a prioritized execution roadmap (next 30 / 60 / 90 ` +
      `days); and the single most important thing to do this week. Be concrete and opinionated.`
  );

  // ── Stage 2: Market research validates and sharpens ──────────────────────
  const market = await step(
    "2/6 · Market",
    "market",
    `The idea:\n"""${idea}"""\n\nThe CEO's strategy brief:\n"""${clip(ceo)}"""\n\n` +
      `Produce the market intelligence report. Include: the 3–5 most relevant competitors ` +
      `with their strengths, weaknesses, and pricing; the specific market gap this company ` +
      `should own; a SWOT analysis; 2–3 detailed ICP customer personas (goals, pains, buying ` +
      `triggers, objections); a recommended pricing strategy with concrete tiers and prices; ` +
      `and the sharpest product positioning statement. Challenge the CEO's assumptions where ` +
      `the market doesn't support them.`
  );

  // Shared context handed to every parallel specialist.
  const brief =
    `IDEA:\n"""${idea}"""\n\n` +
    `STRATEGY (CEO):\n"""${clip(ceo)}"""\n\n` +
    `MARKET (Research):\n"""${clip(market)}"""`;

  // ── Stage 3: Specialists build in parallel off the shared brief ──────────
  onProgress({ stage: "3/6 · Build", agent: "Content · Sales · Dev · Data", status: "start" });
  await Promise.all([
    step(
      "3/6 · Build",
      "content",
      `${brief}\n\nProduce the launch content kit: (1) full landing-page copy ` +
        `(hero headline + subhead, 3 benefit blocks, social proof section, FAQ teaser, and ` +
        `final CTA); (2) a 5-email launch/nurture sequence with subject lines; (3) 5 social ` +
        `posts and 2 short-form video/reel scripts. Keep a consistent, distinctive brand voice.`
    ),
    step(
      "3/6 · Build",
      "sales",
      `${brief}\n\nProduce the go-to-market sales playbook: (1) a lead qualification ` +
        `framework (who to target, how to score them); (2) two cold email sequences ` +
        `(3 emails each) and a LinkedIn outreach message set; (3) a discovery-call script; ` +
        `(4) an objection-handling table (objection → response); (5) a closing framework ` +
        `and a one-page proposal template.`
    ),
    step(
      "3/6 · Build",
      "developer",
      `${brief}\n\nProduce the technical plan for a shippable MVP: (1) recommended ` +
        `architecture and tech stack with justification; (2) the core data model and key API ` +
        `endpoints; (3) a scoped MVP feature list (must-have vs later); (4) a security and ` +
        `scalability checklist; (5) a build sequence a small team can execute in 4–6 weeks.`
    ),
    step(
      "3/6 · Build",
      "data",
      `${brief}\n\nProduce the analytics plan: (1) the North Star metric and the KPI ` +
        `tree beneath it; (2) the acquisition→activation→revenue→retention funnel with the ` +
        `events to instrument at each step; (3) a churn-analysis approach; (4) a simple ` +
        `12-month revenue forecast with stated assumptions; (5) the dashboard layout ` +
        `(which charts, which cadence) the team should review weekly.`
    ),
  ]);
  onProgress({ stage: "3/6 · Build", agent: "Content · Sales · Dev · Data", status: "done" });

  // ── Stage 4: Support designs the post-sale experience ────────────────────
  await step(
    "4/6 · Support",
    "support",
    `${brief}\n\nCONTENT already produced:\n"""${clip(sections.content, 2500)}"""\n\n` +
      `Produce the customer success system: (1) a 12-question knowledge-base FAQ with answers; ` +
      `(2) response templates for the top 3 support scenarios including refunds; (3) an ` +
      `escalation workflow; (4) a retention/anti-churn playbook; (5) 3 concrete upsell ` +
      `opportunities and how to trigger them.`
  );

  // ── Stage 5: CEO synthesizes everything into one execution plan ──────────
  const synthesis = await step(
    "5/6 · Synthesis",
    "ceo",
    `You are closing the loop as CEO. Here is everything the team produced:\n\n` +
      `MARKET:\n"""${clip(market, 3000)}"""\n\n` +
      `SALES:\n"""${clip(sections.sales, 2500)}"""\n\n` +
      `DEVELOPER:\n"""${clip(sections.developer, 2500)}"""\n\n` +
      `DATA:\n"""${clip(sections.data, 2500)}"""\n\n` +
      `SUPPORT:\n"""${clip(sections.support, 2000)}"""\n\n` +
      `Synthesize a single, prioritized 90-day execution plan the founder can act on ` +
      `Monday morning. Include: the 3 things that matter most right now; a week-by-week ` +
      `plan for the first 4 weeks with an owner (which function) per item; the top risks ` +
      `and how to de-risk them; and the concrete definition of success at day 90.`
  );

  // ── Stage 6: Assemble the deliverable ────────────────────────────────────
  onProgress({ stage: "6/6 · Assemble", agent: "Startup Team OS", status: "start" });
  const llm = getLLMInfo();
  const blueprint = assembleBlueprint({ idea, sections, synthesis, llm });
  onProgress({ stage: "6/6 · Assemble", agent: "Startup Team OS", status: "done" });

  return { idea, provider: llm.provider, model: llm.model, effort: llm.effort, sections, blueprint };
}

// Builds the final single-document blueprint from all agent outputs.
function assembleBlueprint({ idea, sections, synthesis, llm }) {
  const stamp = new Date().toISOString();
  return `# 🚀 Startup Blueprint

**Idea:** ${idea}

**Generated:** ${stamp}
**Engine:** Startup Team OS · provider \`${llm.provider}\` · model \`${llm.model}\` · effort \`${llm.effort}\`

---

## 🧭 Executive Summary & 90-Day Execution Plan
_by ${AGENTS.ceo.name}_

${synthesis}

---

## 1. Founding Strategy
_by ${AGENTS.ceo.name}_

${sections.ceo}

---

## 2. Market Intelligence
_by ${AGENTS.market.name}_

${sections.market}

---

## 3. Launch Content Kit
_by ${AGENTS.content.name}_

${sections.content}

---

## 4. Sales Playbook
_by ${AGENTS.sales.name}_

${sections.sales}

---

## 5. Technical Plan (MVP)
_by ${AGENTS.developer.name}_

${sections.developer}

---

## 6. Analytics & Metrics
_by ${AGENTS.data.name}_

${sections.data}

---

## 7. Customer Success System
_by ${AGENTS.support.name}_

${sections.support}

---

_Generated automatically by [Startup Team OS](./README.md). Review before acting on financial, legal, or hiring decisions._
`;
}
