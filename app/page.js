"use client";

import { useState } from "react";

const prompt = "cuentame una historia corta y simple";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      text: "¡Hola! Cuando quieras, puedo contarte una historia corta.",
      type: "gemini",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  async function tellStory() {
    const loadingId = crypto.randomUUID();
    setIsLoading(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: crypto.randomUUID(), text: prompt, type: "user" },
      {
        id: loadingId,
        text: "Estoy pensando en una historia...",
        type: "status",
      },
    ]);

    try {
      const response = await fetch("/api/story", { method: "POST" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo obtener una historia.");
      }

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === loadingId
            ? { ...message, text: result.text, type: "gemini" }
            : message
        )
      );
    } catch (error) {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === loadingId
            ? {
                ...message,
                text: error.message,
                type: "error",
              }
            : message
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="chat">
      <header className="chat__header">
        <span className="chat__avatar" aria-hidden="true">
          G
        </span>
        <div>
          <h1>Historias con Gemini</h1>
          <p>Un pequeño rincón para imaginar</p>
        </div>
      </header>

      <section
        className="chat__messages"
        aria-label="Conversación"
        aria-live="polite"
      >
        {messages.map((message) => (
          <article
            className={`message message--${message.type}`}
            key={message.id}
          >
            <p>{message.text}</p>
          </article>
        ))}
      </section>

      <footer className="chat__footer">
        <button
          className="chat__button"
          disabled={isLoading}
          onClick={tellStory}
          type="button"
        >
          {isLoading ? "Esperando a Gemini..." : "Cuéntame una historia"}
        </button>
        <p className="chat__hint">Gemini responderá aquí en el chat.</p>
      </footer>
    </main>
  );
}
