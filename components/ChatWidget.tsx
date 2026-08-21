"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, CheckCircle2, Send, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Message = {
  id: string;
  role: "assistant" | "user" | "notice";
  text: string;
};

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I can help with Coded Mind's free developer tools, data services, or job openings. What can I help you with?",
};

const STARTERS = [
  "What free tools do you offer?",
  "Tell me about your data services",
  "Are there any job openings?",
  "How do I merge PDF files?",
];

// Normalize model output for display: markdown bullets → "•", strip bold/heading markers
function formatAssistantText(text: string): string {
  return text
    .replace(/^[ \t]*[-*][ \t]+/gm, "• ")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^#+[ \t]+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-stone-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function ChatWidget() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [input,     setInput]     = useState("");
  const [messages,  setMessages]  = useState<Message[]>([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);

  /**
   * A launcher nobody clicks is a launcher that never explains itself. After a
   * short delay we surface one concrete question the assistant can answer, with
   * one-tap starters — asking is then a single click rather than "open a box,
   * think of a question, type it".
   *
   * Shown once. Dismissing or opening the chat remembers that in this browser,
   * so it never nags a returning visitor.
   */
  const [teaser, setTeaser] = useState(false);
  const [pinged, setPinged] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen]);

  // Surface the teaser once per browser, and only after the visitor has had a
  // moment to look at the page. Never on top of an already-open chat.
  useEffect(() => {
    let seen = true;
    try {
      seen = window.localStorage.getItem("cm_chat_teaser_seen") === "1";
    } catch {
      // Storage blocked — treat as seen so we err toward not interrupting.
    }
    if (seen) return;

    const id = setTimeout(() => {
      setTeaser(true);
      setPinged(true);
    }, 7000);
    return () => clearTimeout(id);
  }, []);

  function retireTeaser() {
    setTeaser(false);
    setPinged(false);
    try {
      window.localStorage.setItem("cm_chat_teaser_seen", "1");
    } catch {
      /* ignore */
    }
  }

  // Auto-focus textarea when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 120);
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    const assistantId = `a-${Date.now()}`;

    setIsOpen(true);
    setError(null);
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .slice(-8)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      // Non-streaming error from our route
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Assistant unavailable.");
      }

      if (!res.body) throw new Error("No response stream received.");

      // The route reports lead capture via headers, since the body is a stream.
      const leadCaptured   = res.headers.get("X-Lead-Captured") === "1";
      const serviceEnquiry = res.headers.get("X-Service-Enquiry") === "1";
      const signedIn       = res.headers.get("X-Signed-In") === "1";

      // Add empty placeholder that we'll fill token-by-token
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", text: "" }]);
      setStreaming(true);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText  = "";

      // eslint-disable-next-line no-constant-condition
      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break outer;

          try {
            const parsed = JSON.parse(payload) as { response?: string };
            if (parsed.response) {
              fullText += parsed.response;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, text: fullText } : m))
              );
            }
          } catch {
            // malformed SSE chunk — skip
          }
        }
      }

      if (!fullText) throw new Error("Empty response — please try again.");

      if (leadCaptured) {
        setMessages((prev) => [
          ...prev,
          {
            id: `n-${Date.now()}`,
            role: "notice",
            text: "Your enquiry has been sent to our team. Expect a reply by email within 1–2 business days.",
          },
        ]);
      } else if (serviceEnquiry && !signedIn) {
        setMessages((prev) => [
          ...prev,
          {
            id: `n-${Date.now()}`,
            role: "notice",
            text: "Sign in — or use the contact page — and we'll route your question straight to the team.",
          },
        ]);
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      // Replace placeholder (if it exists) with fallback, or add new message
      setMessages((prev) => {
        const hasPlaceholder = prev.some((m) => m.id === assistantId);
        const fallback: Message = {
          id: assistantId,
          role: "assistant",
          text: "I'm having trouble right now. Reach us directly at hr@codedmind.co.in.",
        };
        if (hasPlaceholder) return prev.map((m) => (m.id === assistantId ? fallback : m));
        return [...prev, fallback];
      });
    } finally {
      setIsLoading(false);
      setStreaming(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void sendMessage(input);
  }

  const canSend = !!input.trim() && !isLoading;

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-stone-200 bg-[#fafaf9] shadow-2xl shadow-stone-950/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-stone-950 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20">
                  <Bot size={15} className="text-amber-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-none">Coded Mind Assistant</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Tools, services & careers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X size={15} />
              </button>
            </div>

            {/* Starters */}
            <div className="border-b border-stone-200 bg-white px-4 py-3">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Quick questions</p>
              <div className="flex flex-wrap gap-1.5">
                {STARTERS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    disabled={isLoading}
                    className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 transition-colors disabled:opacity-40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesRef}
              // data-lenis-prevent stops the smooth-scroll library from
              // hijacking wheel events here — without it the page scrolls
              // instead of the conversation. overscroll-contain stops the
              // scroll chaining to the page once the list hits top or bottom.
              data-lenis-prevent
              className="max-h-80 space-y-2.5 overflow-y-auto overscroll-contain px-4 py-4 scroll-smooth"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    msg.role === "user"
                      ? "justify-end"
                      : msg.role === "notice"
                        ? "justify-center"
                        : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-stone-950 text-white"
                        : msg.role === "notice"
                          ? "flex items-start gap-2 border border-emerald-200 bg-emerald-50 text-xs text-emerald-900"
                          : "bg-white text-stone-800 border border-stone-200"
                    }`}
                  >
                    {msg.role === "notice" && (
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-600" />
                    )}
                    {msg.role === "assistant" ? formatAssistantText(msg.text) : msg.text}
                    {streaming && msg.id.startsWith("a-") && msg.text && (
                      <span className="inline-block w-0.5 h-3.5 bg-stone-400 ml-0.5 animate-pulse align-middle" />
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator — shown while waiting for first token */}
              {isLoading && !streaming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl border border-stone-200 bg-white">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-stone-200 bg-white p-3.5">
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage(input);
                    }
                  }}
                  rows={2}
                  placeholder="Ask anything… ↵ to send"
                  className="min-h-[48px] flex-1 resize-none rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-amber-400 focus:bg-white"
                />
                <motion.button
                  type="submit"
                  disabled={!canSend}
                  whileHover={canSend ? { scale: 1.05 } : undefined}
                  whileTap={canSend  ? { scale: 0.95 } : undefined}
                  className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl bg-stone-950 text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </motion.button>
              </div>
              {error ? (
                <p className="mt-2 text-[11px] text-rose-500">{error}</p>
              ) : (
                <p className="mt-2 text-[11px] text-stone-400">
                  Shift+Enter for new line · AI assistant — may be inaccurate, confirm details with us
                </p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      {/* Proactive teaser — one concrete question beats a generic invitation */}
      <AnimatePresence>
        {teaser && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[17rem] rounded-2xl border border-stone-200 bg-white p-4 shadow-xl shadow-stone-900/10"
          >
            <button
              type="button"
              onClick={retireTeaser}
              aria-label="Dismiss"
              className="absolute right-2.5 top-2.5 rounded-full p-1 text-stone-300 transition hover:bg-stone-100 hover:text-stone-600"
            >
              <X size={13} />
            </button>

            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-950">
                <Bot size={14} className="text-white" />
              </span>
              <p className="pr-4 text-sm leading-relaxed text-stone-700">
                Looking for something? I can answer instantly.
              </p>
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              {STARTERS.slice(0, 3).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    retireTeaser();
                    void sendMessage(q);
                  }}
                  className="rounded-lg border border-stone-200 px-3 py-2 text-left text-[13px] leading-snug text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => {
          retireTeaser();
          setIsOpen((v) => !v);
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        aria-label={isOpen ? "Close chat" : "Ask a question"}
        className="relative inline-flex items-center gap-2.5 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-950/25 transition-colors hover:bg-stone-800"
      >
        {/* A single attention ring, retired on first interaction — a permanent
            pulse reads as an advert and gets tuned out. */}
        {pinged && !isOpen && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-stone-950"
            initial={{ opacity: 0.55, scale: 1 }}
            animate={{ opacity: 0, scale: 1.35 }}
            transition={{ duration: 1.6, repeat: 2, ease: "easeOut" }}
          />
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? "x" : "chat"}
            initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate:  90,  opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? <X size={16} /> : <Sparkles size={16} />}
          </motion.span>
        </AnimatePresence>
        {isOpen ? "Close" : "Ask us anything"}
      </motion.button>
    </div>
  );
}
