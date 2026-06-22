"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Message = { id: string; role: "assistant" | "user"; text: string };

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

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen]);

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
              className="max-h-80 space-y-2.5 overflow-y-auto px-4 py-4 scroll-smooth"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-stone-950 text-white"
                        : "bg-white text-stone-800 border border-stone-200"
                    }`}
                  >
                    {msg.text}
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
                  Shift+Enter for new line · Powered by AI
                </p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        className="inline-flex items-center gap-2.5 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-950/20 hover:bg-stone-800 transition-colors"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? "x" : "chat"}
            initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate:  90,  opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? <X size={16} /> : <MessageCircle size={16} />}
          </motion.span>
        </AnimatePresence>
        {isOpen ? "Close" : "Chat With Us"}
      </motion.button>
    </div>
  );
}
