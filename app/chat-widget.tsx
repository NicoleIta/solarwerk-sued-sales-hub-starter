"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { sendeChatNachricht, type Nachricht } from "./actions/chat";

const WILLKOMMEN: Nachricht = {
  role: "assistant",
  content: "Hallo! Ich bin dein CRM-Assistent für Solarwerk Süd. Frag mich nach Kunden, Pipeline-Status oder Angeboten.",
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [nachrichten, setNachrichten] = useState<Nachricht[]>([WILLKOMMEN]);
  const [eingabe, setEingabe] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [nachrichten]);

  async function senden() {
    const text = eingabe.trim();
    if (!text || isLoading) return;

    const nutzerNachricht: Nachricht = { role: "user", content: text };
    const neuerVerlauf = [...nachrichten, nutzerNachricht];
    setNachrichten(neuerVerlauf);
    setEingabe("");
    setIsLoading(true);

    const antwort = await sendeChatNachricht(text, nachrichten.slice(1));
    setNachrichten([...neuerVerlauf, { role: "assistant", content: antwort }]);
    setIsLoading(false);
  }

  return (
    <>
      {/* Chat-Panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-6 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl flex flex-col dark:border-gray-700 dark:bg-gray-900"
          style={{ height: "450px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-xl bg-yellow-400 px-4 py-3">
            <span className="font-semibold text-gray-900">CRM-Assistent</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-gray-900">
              <X size={18} />
            </button>
          </div>

          {/* Nachrichten */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {nachrichten.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:bg-gray-800">
                  …
                </div>
              </div>
            )}
          </div>

          {/* Eingabefeld */}
          <div className="border-t border-gray-200 p-3 flex gap-2 dark:border-gray-700">
            <input
              type="text"
              value={eingabe}
              onChange={(e) => setEingabe(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && senden()}
              placeholder="Frage stellen …"
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              onClick={senden}
              disabled={isLoading || !eingabe.trim()}
              className="rounded-lg bg-yellow-400 px-3 py-2 text-gray-900 hover:bg-yellow-500 disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Bubble */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-gray-900 shadow-lg hover:bg-yellow-500 transition-colors"
        aria-label="Chat öffnen"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}
