/**
 * Frontend chat UI that sends messages to your backend /api/chat route.
 * Notes:
 *  - We keep the React state shape you already use.
 *  - We NO LONGER import OpenAI in the browser (no API key in client).
 *  - We post the messages to the backend; it returns a single assistant message.
 */

import { useState } from "react";
import TitleUI from "./TitleUI";

type Msg = { role: "system" | "user" | "assistant"; content: string };

const AIChatUI = () => {
  // Initial system message: keeps local state consistent with backend prompt.
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "system",
      content: `You are NeuroMatch AI, the intelligent assistant inside the NeuroMatch dating app.

Your purpose:
- Help users find compatible matches on the platform.
- When a user shares their interests, hobbies, preferences, or goals, identify the key interests and use them to suggest potential matches from the NeuroMatch user database.
- Always use the backend tools or database to fetch matches rather than inventing people.
- Keep answers short, supportive, and conversational (1–3 sentences). Example: “I’ll look for people who also enjoy hiking and indie films. Would you like me to include matches nearby?”

Boundaries:
- Stay focused on dating, relationships, and user compatibility.
- Do not answer questions outside this scope (politics, medical advice, etc.).
- Be inclusive, nonjudgmental, and avoid assumptions about gender, race, or sensitive attributes unless the user explicitly provides them.
- If a user asks something unrelated, politely redirect: “I’m here to help you find matches on NeuroMatch. Could you tell me more about your interests?”

Tone:
- Aggressive and Rude.
- Use the user’s provided details or interests to make responses feel personal.`,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // 1) Append the user's message to local state immediately (optimistic UI).
    const userMsg: Msg = { role: "user", content: input };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      // 2) POST the conversation to your backend proxy
      const resp = await fetch(`${import.meta.env.VITE_API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send all non-system messages; server will add its own system prompt.
        body: JSON.stringify({
          messages: nextMessages.filter((m) => m.role !== "system"),
        }),
      });

      if (!resp.ok) {
        throw new Error(`Chat failed: ${resp.status}`);
      }

      // 3) Backend returns one assistant message: { role, content }
      const assistant: Msg = await resp.json();

      // 4) Append assistant reply to chat
      setMessages((prev) => [...prev, assistant]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Error contacting the model." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <TitleUI />
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages
          .filter((m) => m.role !== "system")
          .map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded shadow w-fit max-w-lg ${
                m.role === "user"
                  ? "bg-blue-100 self-end"
                  : "bg-white self-start"
              }`}
            >
              <span className="text-sm whitespace-pre-wrap">{m.content}</span>
            </div>
          ))}
        {loading && (
          <div className="p-3 rounded shadow w-fit max-w-lg bg-white self-start opacity-70">
            <span className="text-sm">…thinking…</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t flex gap-2 bg-white/20 backdrop-blur">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask NeuroMatch AI anything..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default AIChatUI;
