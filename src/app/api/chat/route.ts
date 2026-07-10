import { NextRequest, NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "@/lib/chatbot/anthropicClient";
import { SYSTEM_PROMPT } from "@/lib/chatbot/systemPrompt";
import { START_INTAKE_TOOL, isKnownTrack, isValidCategoryForTrack, buildIntakeHandoffUrl } from "@/lib/chatbot/tools";
import { checkRateLimit } from "@/lib/rateLimit";

const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 1024;
const MAX_MESSAGES = 40;
const MAX_CONTENT_LENGTH = 4000;
const RATE_LIMIT = { windowMs: 60 * 1000, max: 20 }; // 20 messages/minute per IP

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function isValidChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const { role, content } = value as Record<string, unknown>;
  return (
    (role === "user" || role === "assistant") &&
    typeof content === "string" &&
    content.length > 0 &&
    content.length <= MAX_CONTENT_LENGTH
  );
}

function sseEvent(event: string, data: unknown): Uint8Array {
  return new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  // Block cross-origin requests
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = (body as Record<string, unknown>)?.messages;
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    !messages.every(isValidChatMessage) ||
    messages[messages.length - 1].role !== "user"
  ) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  if (await checkRateLimit("chat", getClientIp(request), RATE_LIMIT)) {
    return NextResponse.json({ error: "Too many messages. Please slow down." }, { status: 429 });
  }

  const anthropicMessages: Anthropic.MessageParam[] = (messages as ChatMessage[]).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const anthropicStream = getAnthropicClient().messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
          tools: [START_INTAKE_TOOL],
          messages: anthropicMessages,
        });

        anthropicStream.on("text", (delta) => {
          controller.enqueue(sseEvent("text", { delta }));
        });

        anthropicStream.on("error", (error) => {
          controller.enqueue(sseEvent("error", { message: error.message }));
        });

        const finalMessage = await anthropicStream.finalMessage();

        const toolUse = finalMessage.content.find(
          (block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === "start_intake"
        );

        if (toolUse) {
          const input = toolUse.input as Record<string, unknown>;
          if (isKnownTrack(input.track) && isValidCategoryForTrack(input.track, input.category)) {
            controller.enqueue(
              sseEvent("handoff", { url: buildIntakeHandoffUrl(input.track, input.category as string) })
            );
          } else {
            controller.enqueue(sseEvent("error", { message: "Could not resolve track/category for hand-off." }));
          }
        }

        controller.enqueue(sseEvent("done", {}));
      } catch (error) {
        controller.enqueue(sseEvent("error", { message: error instanceof Error ? error.message : "Unknown error" }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
