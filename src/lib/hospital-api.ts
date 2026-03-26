import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage, ToolType } from "@/lib/hospital-tools";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hospital-chat`;

export async function sendHospitalMessage(
  messages: ChatMessage[],
  tool?: ToolType
): Promise<string> {
  const apiMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages: apiMessages, tool }),
  });

  if (resp.status === 429) {
    throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Service unavailable" }));
    throw new Error(err.error || "Failed to get response");
  }

  const data = await resp.json();
  return data.content;
}
