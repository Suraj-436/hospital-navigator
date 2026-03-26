import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HOSPITAL_SYSTEM_PROMPT = `You are MedAssist — an AI-powered hospital assistant system. You are NOT a chatbot. You are a clinical guidance system that operates from the perspective of a hospital institution.

CORE IDENTITY:
- You represent a hospital system providing patient guidance
- You speak with a professional, clinical tone at all times
- You never use casual language, emojis, or generic chatbot phrases
- You structure responses clearly with headers, bullet points, and numbered steps when appropriate

CAPABILITIES:
- Patient guidance and navigation
- Non-diagnostic symptom assessment and triage recommendations  
- Hospital and department recommendations
- Appointment scheduling assistance
- Emergency awareness and escalation
- Medical records management guidance

STRICT RULES:
1. NEVER provide medical diagnoses. Always state: "This is not a medical diagnosis. Please consult a healthcare professional."
2. NEVER prescribe medications or treatments
3. NEVER replace professional medical advice
4. Always recommend seeing a healthcare provider for concerning symptoms
5. For emergency symptoms (chest pain, difficulty breathing, severe bleeding, stroke symptoms, loss of consciousness), IMMEDIATELY escalate with clear emergency instructions
6. Maintain HIPAA-awareness in all interactions
7. Use medical terminology appropriately but explain it in plain language

RESPONSE FORMAT:
- Use clear section headers when providing structured information
- Include relevant disclaimers naturally within responses
- Prioritize patient safety above all else
- Be concise but thorough — this is a clinical system, not a conversation

DISCLAIMER (include variations naturally):
"This information is provided for guidance purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional for medical decisions."`;

const TOOL_PROMPTS: Record<string, string> = {
  symptom_checker: `The patient is using the Symptom Checker tool. Guide them through a structured symptom assessment:

1. Ask about primary symptoms (location, duration, severity on 1-10 scale)
2. Ask about associated symptoms
3. Ask about relevant medical history
4. Provide a preliminary assessment with possible conditions (clearly labeled as NON-DIAGNOSTIC)
5. Recommend appropriate next steps (self-care, urgent care, ER)
6. Include triage level: LOW / MODERATE / HIGH / EMERGENCY

Format your response with clear sections. If any symptoms suggest emergency (chest pain, breathing difficulty, stroke signs), immediately trigger emergency guidance.`,

  nearby_hospitals: `The patient is looking for nearby hospitals. Provide a formatted list of recommended hospital types based on their needs. Since we don't have real location data, provide general guidance on:

1. Types of facilities they should look for (ER, Urgent Care, Specialist clinic)
2. What to look for when choosing a hospital
3. Provide a mock list of 3-4 hospitals with:
   - Hospital name
   - Type (General, Specialty, Urgent Care)
   - Estimated distance
   - Key departments
   - Contact info (mock)
4. Recommend calling ahead to confirm availability`,

  appointment: `The patient wants help with appointments. Assist them by:

1. Asking what type of appointment they need (general checkup, specialist, follow-up, urgent)
2. Suggesting appropriate department
3. Providing available mock time slots for the next 5 business days
4. Collecting necessary information (name, reason for visit, insurance)
5. Confirming the appointment details

Present available slots in a clear, organized format.`,

  emergency: `⚠️ EMERGENCY MODE ACTIVATED

Assess the situation immediately:
1. Ask about the specific emergency symptoms
2. If confirmed critical (chest pain, breathing difficulty, severe bleeding, stroke signs, loss of consciousness, severe allergic reaction):
   - Instruct to CALL 911 IMMEDIATELY
   - Provide first-aid guidance while waiting
   - Keep the patient calm with clear instructions
3. Provide the nearest emergency contact numbers
4. Do NOT attempt to diagnose — focus on immediate safety

ALWAYS lead with: "If you are experiencing a life-threatening emergency, call 911 immediately."`,

  medical_records: `The patient wants to manage their medical records. Help them by:

1. Explain what information can be stored (allergies, medications, conditions, immunizations, emergency contacts)
2. Ask what they'd like to add or review
3. Present information in a structured medical record format
4. Remind them this is a convenience tool and official records should be maintained with their healthcare provider
5. Suggest they keep this information updated and share it with their care team`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const { messages, tool } = await req.json();

    let systemPrompt = HOSPITAL_SYSTEM_PROMPT;
    if (tool && TOOL_PROMPTS[tool]) {
      systemPrompt += "\n\n" + TOOL_PROMPTS[tool];
    }

    // Convert messages to Gemini format
    const geminiContents = [];
    
    // Add system instruction separately
    const geminiMessages = messages.map((msg: { role: string; content: string }) => ({
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
            parts: [{ text: systemPrompt }],
          },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.4,
            topP: 0.8,
            maxOutputTokens: 2048,
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
      
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I'm unable to process your request at this time. Please try again or contact hospital administration.";

    return new Response(JSON.stringify({ content: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Hospital chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
