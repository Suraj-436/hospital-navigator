import type { ToolType } from "@/lib/hospital-tools";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hospital-chat`;

export interface HospitalResponse {
  tool_used: ToolType | "general";
  response: string;
}

export async function sendHospitalMessage(
  messages: { role: string; content: string }[]
): Promise<HospitalResponse> {
  // Only send last 5 messages for context efficiency
  const recentMessages = messages.slice(-5).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages: recentMessages }),
  });

  if (resp.status === 429) {
    throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || "Service unavailable");
  }

  const data = await resp.json();
  return {
    tool_used: data.tool_used || "general",
    response: data.response || data.content || "Unable to process request.",
  };
}
