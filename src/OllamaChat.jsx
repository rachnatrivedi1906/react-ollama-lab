import { useState } from "react";
import Ollama from "ollama";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function OllamaChat() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSend = prompt.trim() !== "" && !loading;

  const handleAsk = async () => {
    if (!canSend) return;
    const userMessage = { role: "user", content: prompt.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setPrompt("");
    setError("");
    setLoading(true);
    try {
      const response = await Ollama.chat({ model: "llama3.2", messages: nextMessages });
      const assistantMessage = { role: "assistant", content: response.message.content };
      setMessages(prev => [...prev, assistantMessage]);
      } catch (e) {
        let friendlyMsg = 'Failed to get response from Ollama.';
        // Detect network fetch failures (e.g., server not running)
        if (e && typeof e === 'object' && 'message' in e && e.message && e.message.includes('Failed to fetch')) {
          friendlyMsg += ' Ensure the Ollama server is running and accessible at the expected URL (e.g., http://localhost:11434).';
        } else if (e && e.message) {
          friendlyMsg += ` ${e.message}`;
        }
        setError(friendlyMsg);
      } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setPrompt("");
    setError("");
    setLoading(false);
  };

  return (
    <section className="chat-shell">
      <div className="chat-card">
        <header className="chat-header">
          <h1>HR Help Assistant</h1>
          <p>Build a local AI chatbot prototype that helps employees ask general HR questions.</p>
        </header>
        <p className="chat-guidance">
          Ask about general HR topics such as benefits, time off, policies, or workplace procedures. Do not enter private, sensitive, or personal information.
        </p>
        <div className="chat-input-area">
          <label htmlFor="chat-prompt" className="sr-only">Ask the HR assistant</label>
          <textarea
            id="chat-prompt"
            rows="5"
            className="chat-textarea"
            placeholder="Ask about benefits, PTO, or workplace policies..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="chat-actions">
          <button className="chat-button" onClick={handleAsk} disabled={!canSend}>Send</button>
          <button
            className="chat-button chat-button-secondary"
            onClick={clearChat}
            disabled={messages.length === 0 && !error && !loading}
          >
            Clear thread
          </button>
        </div>
        {error && <p className="chat-error" role="alert">{error}</p>}
        <div className="message-list" aria-label="Conversation thread">
          {messages.map((msg, idx) => (
            <article key={idx} className="chat-message" aria-label="message">
              <strong>{msg.role === "user" ? "You" : "Assistant"}</strong>: 
              {msg.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              ) : (
                <span>{msg.content}</span>
              )}
            </article>
          ))}
          {loading && <p className="chat-thinking" aria-live="polite">Thinking...</p>}
        </div>
      </div>
    </section>
  );
}