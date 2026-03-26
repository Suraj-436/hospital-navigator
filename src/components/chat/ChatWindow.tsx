import { useRef, useEffect, useState } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { WelcomeScreen } from "./WelcomeScreen";
import { useChat } from "@/hooks/use-chat";
import type { ToolType } from "@/lib/hospital-tools";

const toolPrompts: Record<ToolType, string> = {
  symptom_checker: "I'd like to check my symptoms.",
  nearby_hospitals: "Help me find nearby hospitals.",
  appointment: "I need to schedule an appointment.",
  emergency: "I need emergency assistance.",
  medical_records: "I'd like to access my medical records.",
};

export function ChatWindow() {
  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    sendMessage,
    createConversation,
    setActiveConversationId,
    deleteConversation,
  } = useChat();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleWelcomeTool = (tool: ToolType) => {
    sendMessage(toolPrompts[tool], tool);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onNew={createConversation}
        onDelete={deleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <WelcomeScreen onToolSelect={handleWelcomeTool} />
          ) : (
            <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
