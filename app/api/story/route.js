import { GoogleGenAI } from "@google/genai";

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Falta GEMINI_API_KEY. Agrégala al archivo .env.");
    return Response.json(
      { error: "El servidor no está configurado para usar Gemini." },
      { status: 500 }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "cuentame una historia corta y simple",
    });

    if (!result.text) {
      throw new Error("Gemini devolvió una respuesta vacía.");
    }

    return Response.json({ text: result.text });
  } catch (error) {
    console.error("No se pudo obtener una respuesta de Gemini:", error);
    return Response.json(
      { error: "No se pudo obtener una historia. Inténtalo de nuevo." },
      { status: 502 }
    );
  }
}
