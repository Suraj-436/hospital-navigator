import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UNIFIED_SYSTEM_PROMPT = `You are MedAssist — an AI-powered hospital assistant system. You operate from the perspective of a hospital institution with a professional, clinical tone.

YOUR TASK (for EVERY user message):
1. Detect the user's intent
2. Classify it into exactly ONE category
3. Generate the appropriate response

ALL IN A SINGLE RESPONSE. Do NOT say you are classifying intent — just respond directly.

INTENT CATEGORIES:
- "symptom_checker" — user describes symptoms, health complaints, pain, illness
- "emergency" — critical symptoms: chest pain, breathing difficulty, severe bleeding, stroke signs, loss of consciousness, severe allergic reaction, suicidal thoughts
- "nearby_hospitals" — user asks about finding hospitals, clinics, healthcare facilities
- "appointment" — user wants to book, schedule, reschedule, or cancel appointments
- "medical_records" — user asks about health history, allergies, medications, immunizations
- "general" — greetings, general health questions, anything else

PRIORITY RULE: "emergency" ALWAYS overrides all other intents. If ANY critical symptom is mentioned, classify as emergency.

RESPONSE FORMAT:
You MUST respond with valid JSON only. No markdown code fences. No extra text outside the JSON.

{
  "tool_used": "<intent_category>",
  "response": "<your full response in markdown format>"
}

RESPONSE GUIDELINES BY INTENT:

**emergency**: Lead with "⚠️ If you are experiencing a life-threatening emergency, call 911 immediately." Provide first-aid guidance. Keep the patient calm. Include emergency contacts.

**symptom_checker**: Ask about primary symptoms (location, duration, severity 1-10). Ask about associated symptoms. Provide preliminary NON-DIAGNOSTIC assessment. Recommend next steps. Include triage level: LOW / MODERATE / HIGH.

**nearby_hospitals**: Suggest facility types based on needs. Provide a mock list of 3-4 hospitals with name, type, distance, departments, and contact info. Recommend calling ahead.

**appointment**: Ask what type (general, specialist, follow-up, urgent). Suggest department. Provide mock time slots for next 5 business days. Collect needed info.

**medical_records**: Explain what can be stored. Ask what they want to add or review. Present in structured format. Remind this is a convenience tool.

**general**: Respond helpfully with a professional hospital tone.

STRICT RULES:
1. NEVER provide medical diagnoses. Always disclaim: "This is not a medical diagnosis."
2. NEVER prescribe medications
3. NEVER replace professional medical advice
4. Always recommend seeing a healthcare provider for concerning symptoms
5. Use medical terminology but explain in plain language
6. Include disclaimer naturally: "This information is for guidance only and does not constitute medical advice."
7. Keep responses concise but thorough
8. Use markdown formatting (headers, bullets, numbered lists) in the "response" field`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const { messages } = await req.json();

    // Only keep last 5 messages for context efficiency
    const recentMessages = (messages || []).slice(-5);

    const geminiMessages = recentMessages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: UNIFIED_SYSTEM_PROMPT }],
          },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        tool_used: "general",
        response: "Our system is temporarily unavailable. Please try again shortly or contact hospital administration directly.",
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse the JSON response from the model
    try {
      const parsed = JSON.parse(rawText);
      return new Response(JSON.stringify({
        tool_used: parsed.tool_used || "general",
        response: parsed.response || rawText,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      // Fallback if model doesn't return valid JSON
      return new Response(JSON.stringify({
        tool_used: "general",
        response: rawText,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("Hospital chat error:", e);
    return new Response(
      JSON.stringify({
        tool_used: "general",
        response: "We apologize for the inconvenience. Our system is temporarily unavailable.",
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
