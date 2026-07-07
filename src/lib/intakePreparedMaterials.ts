import {
  getQ2ForTrack,
  getQuestionSequence,
  type V2Question,
  type V2Track,
} from "@/data/intakeV2";
import type { IntakePreparedMaterials } from "@/types";

type IntakeAnswerValue = string | string[] | number;

function isV2Track(value: string): value is V2Track {
  return value === "startup" || value === "individual" || value === "small_business";
}

function humanize(value: string): string {
  return value
    .replace(/^other:\s*/i, "")
    .replace(/^outside_us:\s*/i, "Outside the US: ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function optionLabel(question: V2Question, value: string): string {
  if (value.startsWith("other: ") || value.startsWith("outside_us: ")) return humanize(value);
  return question.options.find((option) => option.value === value)?.label ?? humanize(value);
}

function answerLabel(question: V2Question, value: IntakeAnswerValue | undefined): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "number") {
    if (value === 0) return "Not specified";
    return `$${value.toLocaleString()}`;
  }
  if (Array.isArray(value)) return value.map((item) => optionLabel(question, item)).join(", ");
  return optionLabel(question, value);
}

function getAnsweredItems(
  track: string,
  category: string,
  answers: Record<string, IntakeAnswerValue>
): IntakePreparedMaterials["answeredItems"] {
  if (!isV2Track(track)) return [];
  return getQuestionSequence(track, category)
    .map((question) => ({
      question: question.text,
      answer: answerLabel(question, answers[question.id]),
    }))
    .filter((item) => item.answer.trim().length > 0);
}

function getCategoryName(track: string, category: string, fallback: string): string {
  if (!isV2Track(track)) return fallback || humanize(category);
  return getQ2ForTrack(track).options.find((option) => option.value === category)?.label ?? fallback ?? humanize(category);
}

function getContactRole(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  if (lower.includes("fundraising") || lower.includes("securities")) return "emerging companies or venture financing group";
  if (lower.includes("formation") || lower.includes("governance")) return "startup or corporate group";
  if (lower.includes("intellectual property") || lower.includes("ip")) return "intellectual property group";
  if (lower.includes("employment")) return "employment counsel";
  if (lower.includes("contract")) return "commercial contracts counsel";
  if (lower.includes("regulatory") || lower.includes("compliance")) return "regulatory and compliance group";
  if (lower.includes("family")) return "family law attorney";
  if (lower.includes("estate")) return "estate planning attorney";
  if (lower.includes("immigration")) return "immigration attorney";
  if (lower.includes("criminal")) return "criminal defense attorney";
  if (lower.includes("dispute") || lower.includes("litigation")) return "litigation group";
  return "attorney who handles this practice area";
}

function compactFacts(items: IntakePreparedMaterials["answeredItems"], max = 8): string {
  return items
    .slice(0, max)
    .map((item) => `- ${item.question}: ${item.answer}`)
    .join("\n");
}

export function buildPreparedMaterials(params: {
  track: string;
  category: string;
  categoryName?: string;
  firmName?: string;
  answers: Record<string, IntakeAnswerValue>;
}): IntakePreparedMaterials & { categoryName: string; contactRole: string } {
  const categoryName = getCategoryName(params.track, params.category, params.categoryName ?? "");
  const contactRole = getContactRole(categoryName);
  const answeredItems = getAnsweredItems(params.track, params.category, params.answers);
  const facts = compactFacts(answeredItems);
  const firmName = params.firmName ?? "your firm";

  const summary = [
    `Matter type: ${categoryName}`,
    `Client context: ${isV2Track(params.track) ? humanize(params.track) : "Legal help"}`,
    facts ? `Key intake details:\n${facts}` : "Key intake details: The client completed the LWYRD intake for this matter.",
    "Goal: identify whether the firm is a fit, what the likely scope looks like, and what next steps would be required.",
  ].join("\n\n");

  const outreachMessage = [
    `Hello ${firmName} team,`,
    "",
    `I found your firm through LWYRD while looking for help with ${categoryName}. I am reaching out directly to ask whether this is a matter your ${contactRole} can review.`,
    "",
    "Here is a short summary of my situation:",
    summary,
    "",
    "Could you let me know whether this is within your scope, who the right contact would be, and what the first conversation or engagement process usually looks like?",
    "",
    "Thank you.",
  ].join("\n");

  const talkingPoints = [
    `I need help with ${categoryName}.`,
    answeredItems[0] ? `${answeredItems[0].question}: ${answeredItems[0].answer}` : "I completed a LWYRD intake and have a short written summary ready.",
    answeredItems[1] ? `${answeredItems[1].question}: ${answeredItems[1].answer}` : "I would like to understand fit, scope, timing, and fees.",
    "Can you tell me who should review this and what the next step would be?",
  ];

  return {
    categoryName,
    contactRole,
    summary,
    outreachMessage,
    talkingPoints,
    answeredItems,
  };
}
