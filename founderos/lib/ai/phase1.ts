import { generateJSON } from "./client";
import type { JSONSchema } from "./types";

/** The idea canvas a founder fills out in Phase 1. */
export interface IdeaCanvas {
  problem?: string;
  solution?: string;
  target_customer?: string;
  unique_value?: string;
  business_model?: string;
  /** Any additional canvas sections. */
  [section: string]: string | undefined;
}

/** Structured advisor feedback returned by Phase 1. */
export interface Phase1Response {
  /** The advisor's overall gut reaction to the idea. */
  reaction: string;
  /** The single weakest section of the canvas. */
  weakest_point: string;
  /** Why that section is the weakest. */
  weakest_reason: string;
}

const PHASE1_SYSTEM_PROMPT = `You are a sharp advisor reviewing an idea canvas. Be direct, specific, and honest — no flattery, no hedging. React to the idea as a whole, then identify the single weakest section of the canvas and explain concretely why it is the weakest.`;

const PHASE1_SCHEMA: JSONSchema = {
  type: "object",
  properties: {
    reaction: {
      type: "string",
      description: "Your overall reaction to the idea in 2-3 sentences — direct and specific.",
    },
    weakest_point: {
      type: "string",
      description: "The name of the single weakest section of the canvas (e.g. 'business_model').",
    },
    weakest_reason: {
      type: "string",
      description: "1-2 sentences explaining why that section is the weakest.",
    },
  },
  required: ["reaction", "weakest_point", "weakest_reason"],
  additionalProperties: false,
};

function isPhase1Response(value: unknown): value is Phase1Response {
  const v = value as Partial<Phase1Response> | null;
  return (
    !!v &&
    typeof v.reaction === "string" &&
    typeof v.weakest_point === "string" &&
    typeof v.weakest_reason === "string"
  );
}

/**
 * Send the idea canvas to the active AI provider and get structured advisor
 * feedback. Works against Anthropic, OpenRouter, or NVIDIA depending on
 * AI_PROVIDER — throws a descriptive Error on configuration, API, or
 * parsing failure.
 */
export async function generatePhase1Response(canvas: IdeaCanvas): Promise<Phase1Response> {
  const result = await generateJSON({
    system: PHASE1_SYSTEM_PROMPT,
    user: `Here is the founder's idea canvas as JSON:\n\n${JSON.stringify(canvas, null, 2)}`,
    schema: PHASE1_SCHEMA,
    schemaName: "phase1_response",
  });

  if (!isPhase1Response(result)) {
    throw new Error("The advisor response is missing required fields.");
  }

  return result;
}
