// Export enriched case studies to JSONL format for fine-tuning
import fs from 'fs';

function exportEnrichedToJsonL() {
  try {
    const enrichedData = JSON.parse(fs.readFileSync('./data/enriched-master.json', 'utf8'));

    const questions = [
      "Tell the story of this startup:",
      "Explain the history and key events:",
      "What happened to this company and why?",
      "Analyze the founders and timeline:",
      "Summarize the key metrics and narrative:",
      "What's the lesson from this case?"
    ];

    // Chat format (OpenAI API style)
    const chatLines = enrichedData.map((c, idx) => {
      const q = questions[idx % questions.length];
      const answer = buildAnswer(c);

      return JSON.stringify({
        messages: [
          { role: "system", content: "You are a seasoned VC partner analyzing startup case studies." },
          { role: "user", content: `${q} ${c.name}` },
          { role: "assistant", content: answer }
        ]
      });
    });

    fs.writeFileSync('./data/training/startup-corpus-enriched-chat.jsonl', chatLines.join('\n'));
    console.log(`✓ Chat format: ${chatLines.length} examples → data/training/startup-corpus-enriched-chat.jsonl`);

    // Alpaca format
    const alpacaLines = enrichedData.map((c, idx) => {
      const q = questions[idx % questions.length];
      const answer = buildAnswer(c);

      return JSON.stringify({
        instruction: q,
        input: c.name,
        output: answer
      });
    });

    fs.writeFileSync('./data/training/startup-corpus-enriched-alpaca.jsonl', alpacaLines.join('\n'));
    console.log(`✓ Alpaca format: ${alpacaLines.length} examples → data/training/startup-corpus-enriched-alpaca.jsonl`);

    console.log('\n✅ Export complete. Ready for fine-tuning.');
  } catch (e) {
    console.error('Export failed:', e.message);
    process.exit(1);
  }
}

function buildAnswer(c) {
  const outcome = c.outcome === 'success' ? '✓ SUCCESS' : '✗ FAILED';
  const timeline = c.timeline
    ? c.timeline.map(t => `- ${t.date}: ${t.event}`).join('\n')
    : '(No timeline data)';
  const metrics = c.metrics
    ? c.metrics.map(m => `- ${m}`).join('\n')
    : '(No metrics)';

  return `
## ${c.name} — ${outcome}

### Timeline
${timeline}

### Key Metrics
${metrics}

### Narrative
${c.narrative || c.summary}

### Lesson
${c.lesson}
  `.trim();
}

exportEnrichedToJsonL();
