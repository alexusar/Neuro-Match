import { useState } from "react";
import { InferenceClient } from "@huggingface/inference";
import TitleUI from "./TitleUI";

const client = new InferenceClient(import.meta.env.VITE_HF_TOKEN);

const AIChatUI = () => {
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful dating assistant named NeuroMatch AI and you are supposed to help the user find another user to date" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const chatCompletion = await client.chatCompletion({
        provider: "fireworks-ai",
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: updatedMessages,
      });

      const reply = chatCompletion.choices[0].message;
      if (reply.content) {
        setMessages((prev) => [
            ...prev,
            {
              role: reply.role,
              content: reply.content || "⚠️ LLaMA returned an empty response.",
            },
          ]);
          
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ No response received." }]);
      }
      
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Error contacting LLaMA 3.1" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <TitleUI />
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages
          .filter((msg) => msg.role !== "system")
          .map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded shadow w-fit max-w-lg ${
                msg.role === "user" ? "bg-blue-100 self-end" : "bg-white self-start"
              }`}
            >
              <span className="text-sm whitespace-pre-wrap">{msg.content}</span>
            </div>
          ))}
      </div>
      <div className="p-4 border-t flex gap-2">
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
