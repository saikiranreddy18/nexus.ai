#!/usr/bin/env node
// Command-line entrypoint.
//
//   node src/cli.js "an app that helps freelancers get paid faster"
//   echo "my idea" | node src/cli.js
//
// Writes the finished blueprint to runs/<timestamp>-<slug>.md and prints the path.

import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runStartupPipeline } from "./orchestrator.js";
import { getLLMInfo } from "./llm.js";

const here = dirname(fileURLToPath(import.meta.url));
const runsDir = join(here, "..", "runs");

async function readStdin() {
  if (process.stdin.isTTY) return "";
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data.trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "idea";
}

async function main() {
  const idea = (process.argv.slice(2).join(" ").trim() || (await readStdin())).trim();

  if (!idea) {
    console.error('Usage: node src/cli.js "your business idea"');
    process.exit(1);
  }

  const llm = getLLMInfo();
  if (!llm.hasKey && !process.env.ANTHROPIC_AUTH_TOKEN) {
    console.error(
      "Error: no API key found for any provider.\n" +
      "Set one of OPENROUTER_API_KEY / ANTHROPIC_API_KEY / OPENAI_API_KEY / GOOGLE_API_KEY / NVIDIA_API_KEY\n" +
      "(see .env.example), or save a key on the ⚙️ Settings page (/settings)."
    );
    process.exit(1);
  }

  console.error(`\n🚀 Startup Team OS — ${llm.provider} · ${llm.model} — spinning up the team for:\n   "${idea}"\n`);

  const { blueprint } = await runStartupPipeline(idea, ({ stage, agent, status }) => {
    const icon = status === "start" ? "▶" : status === "done" ? "✓" : "✗";
    console.error(`   ${icon} [${stage}] ${agent}`);
  });

  await mkdir(runsDir, { recursive: true });
  const file = join(runsDir, `${Date.now()}-${slugify(idea)}.md`);
  await writeFile(file, blueprint, "utf8");

  console.error(`\n✅ Blueprint ready:\n   ${file}\n`);
  // Blueprint to stdout so it can be piped/redirected; logs go to stderr.
  process.stdout.write(blueprint);
}

main().catch((err) => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
