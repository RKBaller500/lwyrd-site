import type Anthropic from "@anthropic-ai/sdk";
import { getQ2ForTrack, type V2Track } from "@/data/intakeV2";

const VALID_TRACKS: V2Track[] = ["startup", "individual", "small_business"];

export const START_INTAKE_TOOL: Anthropic.Tool = {
  name: "start_intake",
  description:
    "Call this only after the visitor has confirmed both their track and their category out loud in " +
    "the conversation — never guess ahead of what they've actually said. This hands them off into the " +
    "intake wizard with those two answers pre-filled so they don't repeat themselves.",
  input_schema: {
    type: "object",
    properties: {
      track: {
        type: "string",
        enum: VALID_TRACKS,
        description: "Which of the three tracks the visitor belongs to.",
      },
      category: {
        type: "string",
        description:
          "The category value (slug) for the chosen track, exactly as listed for that track in the " +
          "system prompt's category knowledge base — e.g. 'ip', 'fundraising', 'family'.",
      },
    },
    required: ["track", "category"],
    additionalProperties: false,
  },
};

export function isKnownTrack(value: unknown): value is V2Track {
  return typeof value === "string" && (VALID_TRACKS as string[]).includes(value);
}

export function isValidCategoryForTrack(track: V2Track, category: unknown): category is string {
  if (typeof category !== "string") return false;
  return getQ2ForTrack(track).options.some((option) => option.value === category);
}

export function buildIntakeHandoffUrl(track: V2Track, category: string): string {
  const params = new URLSearchParams({ track, category });
  return `/intake?${params.toString()}`;
}
