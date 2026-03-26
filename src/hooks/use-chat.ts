import { useState, useCallback } from "react";
import type { ChatMessage, ToolType } from "@/lib/hospital-tools";
import { sendHospitalMessage } from "@/lib/hospital-api";

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const messages = activeConversation?.messages || [];

  const createConversation = useCallback((): string => {
    const id = crypto.randomUUID();
    const conv: Conversation = {
      id,
      title: "New Consultation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConversationId(id);
    return id;
  }, []);

  const sendMessage = useCallback(
    async (content: string, tool?: ToolType) => {
      let convId = activeConversationId;
      if (!convId) {
        convId = createConversation();
      }

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        tool,
        timestamp: new Date(),
      };

      // Generate title from first message
      const isFirstMessage = messages.length === 0;
      const title = isFirstMessage
        ? content.slice(0, 40) + (content.length > 40 ? "..." : "")
        : undefined;

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...c.messages, userMsg],
                updatedAt: new Date(),
                ...(title ? { title } : {}),
              }
            : c
        )
      );

      setIsLoading(true);

      try {
        const allMessages = [...messages, userMsg];
        const response = await sendHospitalMessage(allMessages, tool);
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response,
          tool,
          timestamp: new Date(),
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: new Date() }
              : c
          )
        );
      } catch {
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "We apologize for the inconvenience. Our system is temporarily unavailable. Please try again or contact hospital administration directly.",
          timestamp: new Date(),
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, errorMsg], updatedAt: new Date() }
              : c
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversationId, messages, createConversation]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    },
    [activeConversationId]
  );

  return {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    isLoading,
    sendMessage,
    createConversation,
    setActiveConversationId,
    deleteConversation,
  };
}
