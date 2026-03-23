"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const starterPrompts = [
  "What services do you offer?",
  "Tell me about the current internship opening.",
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi, I can help with Coded Mind services, job openings, and how to apply.",
  },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!messagesRef.current) {
      return;
    }

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, isOpen]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();

    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setIsOpen(true);
    setError(null);
    setInput("");
    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);

    try {
      const history = messages
        .filter((message) => message.id !== "welcome")
        .slice(-8)
        .map((message) => ({
          role: message.role,
          text: message.text,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.message) {
        throw new Error(
          data.error ||
            "The assistant is unavailable right now. Please try again shortly."
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: data.message,
        },
      ]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while contacting the assistant.";

      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: "I’m having trouble replying right now. You can also reach us at hr@codedmind.co.in.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {isOpen ? (
        <div className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-stone-200 bg-[#fcfaf6] shadow-2xl shadow-stone-900/15">
          <div className="flex items-center justify-between bg-stone-950 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300">
                <Bot size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">Coded Mind Assistant</p>
                <p className="text-xs text-stone-300">
                  For clients and job seekers
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-stone-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          <div className="border-b border-stone-200 bg-white px-5 py-3">
            <div className="flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={messagesRef}
            className="max-h-[24rem] space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-amber-600 text-white"
                      : "bg-white text-stone-800 border border-stone-200"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-500">
                  Thinking...
                </div>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-stone-200 bg-white p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={2}
                placeholder="Ask about services, careers, or the current opening..."
                className="min-h-[52px] flex-1 resize-none rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-amber-600 text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            {error ? (
              <p className="mt-2 text-xs text-rose-600">{error}</p>
            ) : (
              <p className="mt-2 text-xs text-stone-500">
                Powered by AI. For formal applications, use the careers form.
              </p>
            )}
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center gap-3 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-900/20 transition hover:bg-stone-800"
      >
        {isOpen ? <X size={18} /> : <MessageCircle size={18} />}
        Chat With Us
      </button>
    </div>
  );
}
