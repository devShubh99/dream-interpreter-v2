import type { Handler } from "@netlify/functions";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

const BASE_SYSTEM_PROMPT = `You are a warm, intuitive dream guide and Jungian analyst. You are chatting with a user about their latest dream.
You understand dreams on a deep level — the hidden emotions, the patterns, the symbols your mind uses to process everything — but you explain it all in a way that actually makes sense, like a trusted friend.
No jargon. No lectures. Just real, grounded interpretations that feel personal and easy to connect with.
Use relevant emojis to make your messages visually engaging and expressive. Keep your responses concise, conversational, and focused on helping the user explore their subconscious.`;

const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Gemini API key not configured" }) };
  }

  let dreamText: string;
  let interpretation: any;
  let pastDreams: string[] = [];
  let chatHistory: { role: string; content: string }[] = [];
  let newMessage: string;

  try {
    const body = JSON.parse(event.body || "{}");
    dreamText = body.dreamText;
    interpretation = body.interpretation;
    pastDreams = body.pastDreams || [];
    chatHistory = body.chatHistory || [];
    newMessage = body.newMessage;
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  if (!dreamText || !newMessage) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "dreamText and newMessage are required" }) };
  }

  // Construct context block for the system instruction
  let contextBlock = `\n\n--- CONTEXT FOR THIS CHAT ---\n`;
  contextBlock += `CURRENT DREAM:\n"${dreamText}"\n\n`;
  
  if (interpretation) {
    contextBlock += `CURRENT INTERPRETATION:\n`;
    contextBlock += `- Themes: ${interpretation.mainThemes?.join(", ")}\n`;
    contextBlock += `- Tone: ${interpretation.emotionalTone}\n`;
    if (interpretation.symbols) {
      contextBlock += `- Symbols: ${interpretation.symbols.map((s: any) => `\n  * ${s.symbol}: ${s.meaning}`).join("")}\n`;
    }
    contextBlock += `- Insight: ${interpretation.personalInsight}\n`;
    contextBlock += `- Guidance: ${interpretation.guidance}\n\n`;
  }

  if (pastDreams.length > 0) {
    contextBlock += `PAST DREAM JOURNAL (last ${pastDreams.length} entries for pattern recognition):\n`;
    pastDreams.forEach((pd, idx) => {
      contextBlock += `- "${pd}"\n`;
    });
  }
  
  const systemInstructionText = BASE_SYSTEM_PROMPT + contextBlock;

  // Format chat history for Gemini API
  // Gemini roles must be 'user' or 'model'
  const contents = chatHistory.map((msg) => ({
    role: msg.role === "ai" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // Append new user message
  contents.push({
    role: "user",
    parts: [{ text: newMessage }],
  });

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstructionText }],
        },
        contents,
        generationConfig: {
          temperature: 0.75,
          topP: 0.95,
          maxOutputTokens: 1024, // Chat messages should be relatively short
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Failed to reach AI service" }) };
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Empty response from AI" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ reply: rawText }) };
  } catch (err) {
    console.error("Chat error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to process chat" }) };
  }
};

export { handler };
