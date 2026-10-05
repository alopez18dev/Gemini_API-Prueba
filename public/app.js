const storyButton = document.querySelector("#story-button");
const messages = document.querySelector("#messages");
const prompt = "cuentame una historia corta y simple";
const apiUrl =
  window.location.port === "5500"
    ? "http://127.0.0.1:3000/api/story"
    : "/api/story";

function addMessage(text, className) {
  const message = document.createElement("article");
  message.className = `message ${className}`;
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  message.append(paragraph);
  messages.append(message);
  message.scrollIntoView({ behavior: "smooth", block: "end" });
  return message;
}

storyButton.addEventListener("click", async () => {
  storyButton.disabled = true;
  storyButton.textContent = "Esperando a Gemini...";
  addMessage(prompt, "message--user");
  const loadingMessage = addMessage(
    "Estoy pensando en una historia...",
    "message--gemini message--status"
  );

  try {
    const response = await fetch(apiUrl, { method: "POST" });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "No se pudo obtener una historia.");
    }

    loadingMessage.remove();
    addMessage(result.text, "message--gemini");
  } catch (error) {
    loadingMessage.remove();
    addMessage(error.message, "message--gemini message--error");
  } finally {
    storyButton.disabled = false;
    storyButton.textContent = "Cuéntame una historia";
  }
});
