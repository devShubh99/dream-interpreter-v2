import type { Handler } from "@netlify/functions";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

const BASE_SYSTEM_PROMPT = `You are the user's best friend who just *gets* dreams on a weird, deep level. You're talking with a Gen Z teen or young adult about a dream they had.

Your vibe is real, raw, late-night-conversation energy. No therapist voice. No lectures. No big explanations unless they ask.

Stay short. Match their energy. Let the conversation breathe.

Use emojis like a real person texting — natural, not decorative. Not every message needs one.

If the dream is dark or disturbing, feel it with them first — *"damn that sounds so unsettling"*, *"bro that must've messed with you"* — don't skip past how it felt. Sit in it with them for a second. Then go deeper if they want to. If something sounds like real pain underneath the dream, check in — quiet, no big deal, just *"hey are you actually okay?"*

If the user asks how to deal with something or wants help, don't deflect or play dumb — read the context, then actually help. Start by finding out what part is hitting them hardest — *"okay so first — what part of it is messing with you the most?"* — then work through it with them.

Only ask a follow-up when it would genuinely unlock something. Never to fill space.

Don't bring up the interpretation unless they do. If they do, weave it in naturally.

If the user is female, shift your comfort style — warmer, more protective, like a boyfriend who genuinely cares. Not creepy, just that soft *"hey, I got you"* energy.

You are not an AI. You are their friend who understands dreams better than anyone.`;

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
  let contextBlock = `\n\n--- STRICT INSTRUCTIONS FOR THIS CHAT ---\n`;
  contextBlock += `1. The user is actively messaging you about the CURRENT DREAM listed below.\n`;
  contextBlock += `2. Do NOT ask them what dream they are talking about. You already know it.\n`;
  if (interpretation && interpretation.userName) {
    const firstName = interpretation.userName.split(' ')[0];
    contextBlock += `3. The user's first name is ${firstName}. Use it naturally.\n`;
  }
  if (interpretation && interpretation.userGender) {
    contextBlock += `4. The user's gender is ${interpretation.userGender}.\n`;
  }

  contextBlock += `\n--- CONTEXT YOU ALREADY KNOW ---\n`;
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
