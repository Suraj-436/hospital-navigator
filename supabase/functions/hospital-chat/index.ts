import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UNIFIED_SYSTEM_PROMPT = `You are an advanced hospital assistant AI.

Your responsibilities:
1. Understand the user's intent
2. Classify it into ONE of the following:
   - symptom_checker
   - nearby_hospitals
   - appointment
   - emergency
   - general
3. Respond appropriately based on the intent

Rules:
- If user mentions symptoms → act as symptom checker
- If user mentions severe symptoms (chest pain, breathing issues, bleeding, stroke signs, loss of consciousness, severe allergic reaction) → treat as emergency
- If user asks for hospitals → provide nearby hospital suggestions (mock if needed)
- If booking → simulate appointment process
- If user asks about medical records, allergies, medications → medical_records
- Otherwise → general helpful response

IMPORTANT:
- Do NOT say you are classifying intent
- Directly give the final answer
- Keep responses structured and helpful
- Use a professional hospital tone
- NEVER provide medical diagnoses. Always disclaim: "This is not a medical diagnosis."
- NEVER prescribe medications
- Always recommend seeing a healthcare provider for concerning symptoms

RESPONSE FORMAT:
You MUST respond with valid JSON only. No markdown code fences. No extra text outside the JSON.

{
  "tool_used": "<intent_category>",
  "response": "<your full response in markdown format>"
}

RESPONSE GUIDELINES BY INTENT:

**emergency**: Lead with "⚠️ If you are experiencing a life-threatening emergency, call 911 immediately." Provide first-aid guidance. Keep the patient calm.

**symptom_checker**: Ask about symptoms (location, duration, severity 1-10). Provide preliminary NON-DIAGNOSTIC assessment. Recommend next steps. Include triage level: LOW / MODERATE / HIGH.

**nearby_hospitals**: Suggest facility types. Provide a mock list of 3-4 hospitals with name, type, distance, departments.

**appointment**: Ask what type (general, specialist, follow-up). Suggest department. Provide mock time slots.

**medical_records**: Explain what can be stored. Present in structured format.

**general**: Respond helpfully with a professional hospital tone.

Include disclaimer naturally: "This information is for guidance only and does not constitute medical advice."`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const { messages } = await req.json();

    // Only keep last 5 messages for context efficiency
    const recentMessages = (messages || []).slice(-5);

    const openRouterMessages = [
      { role: "system", content: UNIFIED_SYSTEM_PROMPT },
      ...recentMessages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-distill-qwen-7b:free",
        messages: openRouterMessages,
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);

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
    let rawText = data.choices?.[0]?.message?.content || "";

    // DeepSeek R1 models include <think>...</think> tags — strip them
    rawText = rawText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // Try to parse JSON from the response
    try {
      // Try direct parse first
      const parsed = JSON.parse(rawText);
      return new Response(JSON.stringify({
        tool_used: parsed.tool_used || "general",
        response: parsed.response || rawText,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      // Try to extract JSON from markdown code fences
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1].trim());
          return new Response(JSON.stringify({
            tool_used: parsed.tool_used || "general",
            response: parsed.response || rawText,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch { /* fall through */ }
      }

      // Fallback: return raw text as general response
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
