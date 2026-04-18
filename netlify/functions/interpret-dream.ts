import type { Handler } from "@netlify/functions";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-live-preview:generateContent";

const SYSTEM_PROMPT = `You are a warm, intuitive dream guide who gets what it's like to be young and figuring life out. You understand dreams on a deep level — the hidden emotions, the patterns, the symbols your mind uses to process everything — but you explain it all in a way that actually makes sense, like a trusted friend who just happens to know a lot about psychology and symbolism.

No jargon. No lectures. Just real, grounded interpretations that feel personal and easy to connect with. You draw from deep psychological ideas and universal symbolism, but you always bring it back to what matters: how the dream might relate to the dreamer's emotions, growth, and everyday life.

Analyze the following dream and provide a thoughtful, warm, and supportive interpretation.
IMPORTANT: Use relevant emojis generously in ALL parts of the interpretation (themes, emotional tone, symbol meanings, personal insight, and guidance) to make it visually engaging and expressive.
You MUST respond with ONLY a valid JSON object (no markdown, no code fences, no extra text) in this exact format:
{
  "mainThemes": ["✨ theme1 with emoji", "🌟 theme2 with emoji", "💫 theme3 with emoji"],
  "emotionalTone": "A rich description with relevant emojis throughout 🌊🌙",
  "sentimentScore": 7,
  "symbols": [
    {"symbol": "Symbol Name", "meaning": "Detailed symbolic meaning with emojis 🗝️✨"},
    {"symbol": "Symbol Name", "meaning": "Detailed symbolic meaning with emojis 🧚‍♂️🌌"}
  ],
  "personalInsight": "A deep, personal insight using emojis to highlight emotions 🌈🧿",
  "guidance": "Gentle, actionable guidance for reflection, with supportive emojis ✍️🌿"
}
Guidelines:
- Identify 3-5 main themes
- Provide 3-6 dream symbols with detailed meanings
- Evaluate a sentimentScore integer from 1 (very negative/nightmarish) to 10 (very positive/euphoric)
- Draw from psychological archetypes, common cultural symbolism, and emotional psychology — explained in plain, relatable language
- ALWAYS include relevant emojis in every field of the response
- Be warm, supportive, and non-judgmental
- Acknowledge challenging emotions while offering positive reframing
- Make the interpretation feel personal and meaningful
- Keep the tone compassionate, encouraging, and visually expressive`;

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
  let userName: string | undefined;
  let userGender: string | undefined;
  try {
    const body = JSON.parse(event.body || "{}");
    dreamText = body.dreamText;
    userName = body.userName;
    userGender = body.userGender;
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  if (!dreamText || typeof dreamText !== "string" || dreamText.trim().length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Dream text is required" }) };
  }

  // Limit dream text length to prevent abuse
  const trimmedDream = dreamText.trim().slice(0, 3000);

  // Build personalized prompt
  const userContext = [
    userName ? `The dreamer's name is ${userName}.` : "",
    userGender ? `The dreamer identifies as ${userGender}.` : ""
  ].filter(Boolean).join(" ");

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${SYSTEM_PROMPT}\n\n${userContext}\n\nDream: "${trimmedDream}"` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.75,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      let detail = "Failed to reach AI service";
      try {
        const errJson = JSON.parse(errText);
        detail = errJson?.error?.message || detail;
      } catch { /* use default */ }
      return { statusCode: 502, headers, body: JSON.stringify({ error: detail }) };
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Empty response from AI" }) };
    }

    // Extract JSON from the response (handles markdown fences or extra text)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in Gemini response:", rawText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Could not parse AI response" }) };
    }

    const interpretation = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!interpretation.mainThemes || !interpretation.symbols || !interpretation.personalInsight || typeof interpretation.sentimentScore !== "number") {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Incomplete interpretation from AI" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(interpretation) };
  } catch (err) {
    console.error("Interpretation error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to interpret dream" }) };
  }
};

export { handler };
