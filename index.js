require("dotenv").config();

const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { GoogleGenAI } = require("@google/genai");

const port = Number(process.env.PORT) || 3000;
const apiKey = process.env.GEMINI_API_KEY;
const prompt = "cuentame una historia corta y simple";
const liveServerOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
]);
const publicDirectory = path.join(__dirname, "public");
const staticFiles = {
"/": { file: "index.html", type: "text/html; charset=utf-8" },
"/styles.css": { file: "styles.css", type: "text/css; charset=utf-8" },
"/app.js": {
file: "app.js",
type: "text/javascript; charset=utf-8",
},
};

function sendJson(response, statusCode, data) {
    response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(data));
}

async function handleRequest(request, response) {
    const origin = request.headers.origin;

    if (origin && !liveServerOrigins.has(origin)) {
      sendJson(response, 403, { error: "Origen no permitido." });
      return;
    }

    if (origin) {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Vary", "Origin");
    }

    if (request.method === "OPTIONS" && origin) {
      response.writeHead(204, {
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      response.end();
      return;
    }

    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

    if (request.method === "GET" && staticFiles[pathname]) {
    const { file, type } = staticFiles[pathname];

    try {
      const content = await fs.readFile(path.join(publicDirectory, file));
      response.writeHead(200, { "Content-Type": type });
      response.end(content);
    } catch (error) {
      console.error(`No se pudo leer el archivo ${file}:`, error);
      response.writeHead(500);
      response.end("No se pudo cargar la página.");
    }
    return;
  }

  if (request.method === "POST" && pathname === "/api/story") {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      if (!result.text) {
        throw new Error("Gemini devolvió una respuesta vacía.");
      }

      sendJson(response, 200, { text: result.text });
    } catch (error) {
      console.error("No se pudo obtener una respuesta de Gemini:", error);
      sendJson(response, 502, {
        error: "No se pudo obtener una historia. Inténtalo de nuevo.",
      });
    }
    return;
  }

  response.writeHead(404);
  response.end("No encontrado.");
}

if (!apiKey) {
  console.error(
    "Falta GEMINI_API_KEY. Agrega tu clave de Gemini al archivo .env."
  );
  process.exitCode = 1;
} else {
  const server = http.createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      console.error("Error inesperado al procesar la solicitud:", error);
      if (!response.headersSent) {
        sendJson(response, 500, { error: "Ocurrió un error inesperado." });
      } else {
        response.destroy(error);
      }
    });
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`Chat disponible en http://localhost:${port}`);
  });
}
