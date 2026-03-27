import type { Handler } from "@netlify/functions";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

const SYSTEM_PROMPT = `You are a compassionate and insightful dream interpreter with deep expertise in Jungian psychology, universal dream symbolism, emotional wellness, and mythology. Analyze the following dream and provide a thoughtful, warm, and supportive interpretation.

You MUST respond with ONLY a valid JSON object (no markdown, no code fences, no extra text) in this exact format:
{
  "mainThemes": ["theme1", "theme2", "theme3"],
  "emotionalTone": "A rich description of the emotional undertones and atmosphere of the dream",
  "symbols": [
    {"symbol": "Symbol Name", "meaning": "Detailed symbolic meaning in the context of this dream"},
    {"symbol": "Symbol Name", "meaning": "Detailed symbolic meaning in the context of this dream"}
  ],
  "personalInsight": "A deep, personal insight about what this dream might reveal about the dreamer's inner world, desires, fears, or growth",
  "guidance": "Gentle, actionable guidance for reflection, journaling, or self-care based on the dream's messages"
}

Guidelines:
- Identify 3-5 main themes
- Provide 3-6 dream symbols with detailed meanings
- Draw from Jungian archetypes, common cultural symbolism, and emotional psychology
- Be warm, supportive, and non-judgmental
- Acknowledge challenging emotions while offering positive reframing
- Make the interpretation feel personal and meaningful
- Keep the tone compassionate and encouraging`;

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
    if (!interpretation.mainThemes || !interpretation.symbols || !interpretation.personalInsight) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Incomplete interpretation from AI" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(interpretation) };
  } catch (err) {
    console.error("Interpretation error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to interpret dream" }) };
  }
};

export { handler };
