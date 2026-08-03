"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import posthog from "posthog-js";
import { usePostHog } from "posthog-js/react";
import { MessageCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";

const serif = { fontFamily: '"Lora", Georgia, serif', fontWeight: 500 } as const;
const ease = [0.25, 0.46, 0.45, 0.94] as const;

// Internal/back-office areas aren't for visitors — the guide has nothing to do there.
const HIDDEN_PATH_PREFIXES = ["/admin", "/portal"];

const GREETING =
  "Hi, I'm the LWYRD Guide. I can help you figure out which track and category fits your " +
  "situation, answer questions about how matching works, and get you started. What's going on?";

// Reduces blank-input friction on first open — one tap answers the questions the
// spec calls out as the ones that stall people before they start.
const STARTER_PROMPTS = [
  "How does matching work?",
  "What does it cost?",
  "I'm not sure where to start",
];

// Survives a refresh (tab close still clears it, same as the rest of this app's
// session-scoped intake state) so a visitor doesn't lose their conversation by
// accident. Bumped if the message shape ever changes incompatibly.
const HISTORY_STORAGE_KEY = "lwyrd_chat_history_v1";

// Mirrors MAX_MESSAGES in the API route — stop proactively instead of letting a
// real request land and bounce off a raw 400.
const MAX_MESSAGES = 40;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Session-storage-backed chat history, read/written outside React so it can be
// shared via useSyncExternalStore. Reading sessionStorage directly during render
// would differ between server and client and trip a hydration mismatch — this
// is the pattern React itself recommends for that: the server/first-hydration
// render uses getServerHistorySnapshot, then React reconciles to the real value
// right after mount, instead of restoring it with a setState call in an effect.
let historyCache: ChatMessage[] = [];
let historyCacheLoaded = false;
const historyListeners = new Set<() => void>();

function readHistoryFromStorage(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // corrupted or inaccessible storage, start fresh
    return [];
  }
}

function getHistorySnapshot(): ChatMessage[] {
  if (!historyCacheLoaded) {
    historyCache = readHistoryFromStorage();
    historyCacheLoaded = true;
  }
  return historyCache;
}

// Must be a stable reference — useSyncExternalStore compares snapshots with
// Object.is, so a fresh [] literal on every call reads as "always changed."
const EMPTY_HISTORY: ChatMessage[] = [];

function getServerHistorySnapshot(): ChatMessage[] {
  return EMPTY_HISTORY;
}

function subscribeHistory(callback: () => void): () => void {
  historyListeners.add(callback);
  return () => historyListeners.delete(callback);
}

// Writes through to sessionStorage immediately, so there's no separate persist
// effect needed, and notifies subscribers so the widget re-renders.
function setHistoryStore(next: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])): void {
  historyCache = typeof next === "function" ? next(historyCache) : next;
  historyCacheLoaded = true;
  try {
    sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyCache));
  } catch {
    // storage full or unavailable, conversation just won't survive a refresh
  }
  historyListeners.forEach((cb) => cb());
}

function parseSseChunk(chunk: string): Array<{ event: string; data: Record<string, unknown> }> {
  const events: Array<{ event: string; data: Record<string, unknown> }> = [];
  for (const block of chunk.split("\n\n")) {
    if (!block.trim()) continue;
    const eventLine = block.split("\n").find((l) => l.startsWith("event: "));
    const dataLine = block.split("\n").find((l) => l.startsWith("data: "));
    if (!eventLine || !dataLine) continue;
    try {
      events.push({
        event: eventLine.slice("event: ".length),
        data: JSON.parse(dataLine.slice("data: ".length)),
      });
    } catch {
      // malformed chunk, skip
    }
  }
  return events;
}

export default function ChatWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const ph = usePostHog();

  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const history = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerHistorySnapshot);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reachedHandoff, setReachedHandoff] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, isStreaming]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!hasOpenedOnce) {
      setHasOpenedOnce(true);
      ph?.capture("chatbot_opened");
    }
  };

  // Lets non-React markup (e.g. the "Try the chatbot" CTA in the raw marketing
  // page HTML) open the widget without needing access to this component's state.
  // Declared before the HIDDEN_PATH_PREFIXES early return so hook order stays
  // consistent across client-side navigations between hidden and visible routes.
  useEffect(() => {
    const listener = () => handleOpen();
    window.addEventListener("lwyrd:open-chat", listener);
    return () => window.removeEventListener("lwyrd:open-chat", listener);
  });

  if (HIDDEN_PATH_PREFIXES.some((p) => pathname?.startsWith(p))) return null;

  const handleClose = () => {
    setIsOpen(false);
    ph?.capture("chatbot_closed", {
      message_count: history.filter((m) => m.role === "user").length,
      reached_handoff: reachedHandoff,
    });
  };

  const handleReset = () => {
    setHistoryStore([]);
    setError(null);
    setReachedHandoff(false);
    ph?.capture("chatbot_reset");
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    // Stop proactively instead of sending a request the API will reject anyway
    // (MAX_MESSAGES in src/app/api/chat/route.ts) — a clear in-chat message beats
    // a raw 400 surfacing as a generic error bubble.
    if (history.length >= MAX_MESSAGES - 1) {
      setError(
        "This conversation's gotten long enough that it's time for a fresh start. " +
          "Use the reset button above to begin a new one, your progress on track and " +
          "category so far isn't lost if you already confirmed them."
      );
      return;
    }

    const nextHistory: ChatMessage[] = [...history, { role: "user", content: trimmed }];
    const userMessageCount = nextHistory.filter((m) => m.role === "user").length;
    setHistoryStore(nextHistory);
    setInput("");
    setError(null);
    setIsStreaming(true);
    ph?.capture("chatbot_message_sent", { message_count: userMessageCount });

    // Placeholder assistant turn we append streamed text into.
    setHistoryStore((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
      });

      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong. Please try again.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let handoffUrl: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const { event, data } of parseSseChunk(parts.join("\n\n"))) {
          if (event === "text" && typeof data.delta === "string") {
            const delta = data.delta;
            setHistoryStore((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + delta };
              return copy;
            });
          } else if (event === "handoff" && typeof data.url === "string") {
            handoffUrl = data.url;
          } else if (event === "error" && typeof data.message === "string") {
            setError(data.message);
          }
        }
      }

      if (handoffUrl) {
        const trackMatch = handoffUrl.match(/track=([^&]+)/);
        const categoryMatch = handoffUrl.match(/category=([^&]+)/);
        setReachedHandoff(true);
        ph?.capture("chatbot_handoff", {
          track: trackMatch ? decodeURIComponent(trackMatch[1]) : undefined,
          category: categoryMatch ? decodeURIComponent(categoryMatch[1]) : undefined,
          message_count: userMessageCount,
        });
        window.setTimeout(() => router.push(handoffUrl!), 1100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      ph?.capture("chatbot_error", {
        message: err instanceof Error ? err.message : "unknown",
      });
    } finally {
      setIsStreaming(false);
      // A turn that errored before any text arrived (or that was tool-call-only,
      // e.g. an immediate handoff) leaves the placeholder assistant message
      // empty. Fill it with a short fallback rather than a permanent blank
      // bubble. This can't just be dropped from history either: the Anthropic
      // API rejects both empty content blocks AND two consecutive user turns,
      // so removing it would trade one failure mode (empty content) for another
      // (broken role alternation) on the visitor's very next message.
      setHistoryStore((prev) => {
        const last = prev[prev.length - 1];
        if (!last || last.role !== "assistant" || last.content.trim() !== "") return prev;
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: "Sorry, I wasn't able to respond to that." };
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    // Keep the guide out of the way on phones. Mobile pages already have dense
    // CTAs and browser chrome, so the launcher is desktop/tablet-only.
    <div className="fixed bottom-6 right-5 z-[45] hidden flex-col items-end gap-3 md:flex">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease }}
            className="flex max-h-[min(600px,calc(100vh-120px))] min-h-[320px] w-[min(400px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-[#ddd7cc] bg-[#fbfaf6] shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 bg-[#002452] px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={16} strokeWidth={2} className="shrink-0" />
                <span style={serif} className="text-[15px] leading-none">LWYRD Chatbot</span>
              </div>
              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    aria-label="Start a new conversation"
                    title="Start a new conversation"
                    className="rounded-xl p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <RotateCcw size={16} strokeWidth={2} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close chat"
                  className="rounded-xl p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              aria-label="Conversation with the LWYRD Guide"
              className="flex-1 space-y-3 overflow-y-auto px-5! py-4!"
            >
              <ChatBubble role="assistant" content={GREETING} />
              {history.length === 0 && (
                <div className="flex flex-wrap gap-2 pl-1">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="rounded-full border! border-[#ddd7cc]! bg-white! px-3.5! py-1.5! text-[13px] text-[#002452] transition-colors hover:border-[#002452]! hover:bg-[#002452]/5!"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              {history.map((m, i) => (
                <ChatBubble key={i} role={m.role} content={m.content} pending={isStreaming && i === history.length - 1 && m.content === ""} />
              ))}
              {error && (
                <div className="rounded-2xl border border-[#e3b7ab] bg-[#fbe9e5] px-4 py-2.5 text-[13px] text-[#8a3b2a]">
                  {error}
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-[#ddd7cc] py-3! pl-5! pr-4!">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about LWYRD or describe your situation…"
                aria-label="Message the LWYRD Guide"
                disabled={isStreaming}
                className="flex-1 rounded-2xl border border-[#ddd7cc] bg-white px-4! py-2.5! text-[14px] text-[#002452] placeholder:text-[#9a9488] focus:border-[#002452] focus:outline-none focus:ring-2 focus:ring-[#002452]/15 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                aria-label="Send message"
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-2xl bg-[#002452]! text-white transition-colors hover:bg-[#003170]! disabled:opacity-50"
              >
                <Send size={16} strokeWidth={2} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher */}
      {!isOpen && (
        <motion.button
          type="button"
          onClick={handleOpen}
          aria-label="Open LWYRD Guide chat"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#002452]! text-white shadow-md transition-transform hover:scale-105"
        >
          <MessageCircle size={21} strokeWidth={2} />
        </motion.button>
      )}
    </div>
  );
}

function ChatBubble({
  role,
  content,
  pending,
}: {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4! py-2.5! text-[14px] leading-relaxed shadow-sm ${
          isUser
            ? "bg-[#002452] text-white"
            : "border border-[#ddd7cc] bg-white text-[#1a2436]"
        }`}
      >
        {pending ? <TypingDots /> : renderMessageContent(content, isUser)}
      </div>
    </div>
  );
}

// Markdown-link-only rendering — the system prompt is instructed to write page references as
// [text](/path) so the guide can actually hand off navigation, not just describe it in dead text.
// Deliberately not a full markdown parser: this is a chat widget, not a document renderer.
const MARKDOWN_LINK = /\[([^\]]+)\]\((\/[^)\s]*|https?:\/\/[^)\s]+)\)/g;

function renderMessageContent(content: string, isUser: boolean) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  MARKDOWN_LINK.lastIndex = 0;
  while ((match = MARKDOWN_LINK.exec(content)) !== null) {
    if (match.index > lastIndex) nodes.push(content.slice(lastIndex, match.index));
    const [, label, href] = match;
    const linkClass = isUser
      ? "underline decoration-white/50 hover:decoration-white"
      : "text-[#002452] underline decoration-[#002452]/40 hover:decoration-[#002452] font-medium";
    const trackClick = () => posthog.capture("chatbot_link_clicked", { href, label });
    nodes.push(
      href.startsWith("/") ? (
        <Link key={key++} href={href} className={linkClass} onClick={trackClick}>
          {label}
        </Link>
      ) : (
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className={linkClass} onClick={trackClick}>
          {label}
        </a>
      )
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) nodes.push(content.slice(lastIndex));
  return nodes;
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9a9488]"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </span>
  );
}
