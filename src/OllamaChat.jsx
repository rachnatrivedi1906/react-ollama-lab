import { useState } from "react";
import Ollama from "ollama";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function OllamaChat() {
  // TODO: Add state for input, messages, loading, and error.

  const handleAsk = async () => {
    // TODO: Prevent empty submissions and duplicate submissions while loading.
    // TODO: Create a user message object.
    // TODO: Add the user message to the message thread.
    // TODO: Clear the input, reset errors, and turn loading on.
    // TODO: Call Ollama.chat with model "llama3.2" and the updated message history.
    // TODO: Add the assistant response to the message thread.
    // TODO: Show a helpful error if the request fails.
    // TODO: Turn loading off after success or failure.
  };

  const clearChat = () => {
    // TODO: Clear messages, input, and error.
  };

  return (
    <section className="chat-shell">
      <div className="chat-card">
        <header className="chat-header">
          <h1>HR Help Assistant</h1>
          <p>
            Build a local AI chatbot prototype that helps employees ask general HR questions.
          </p>
        </header>

        <p className="chat-guidance">
          Ask about general HR topics such as benefits, time off, policies, or workplace procedures.
          Do not enter private, sensitive, or personal information.
        </p>

        <div className="chat-input-area">
          <label htmlFor="chat-prompt" className="sr-only">
            Ask the HR assistant
          </label>
          {/* TODO: Set up textarea */}
          <textarea
            id="chat-prompt"
            rows="5"
            className="chat-textarea"
            placeholder="Ask about benefits, PTO, or workplace policies..."
          />
        </div>

        {/* TODO: Configure buttons */}
        <div className="chat-actions">
          <button className="chat-button">Send</button>
          <button className="chat-button chat-button-secondary">Clear thread</button>
        </div>

        <div className="message-list" aria-label="Conversation thread">
          {/* TODO: Render user and assistant messages here. */}
          {/* TODO: Render a temporary Assistant / Thinking... message while loading. */}
        </div>
      </div>
    </section>
  );
}