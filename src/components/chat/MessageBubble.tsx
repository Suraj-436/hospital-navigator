import ReactMarkdown from "react-markdown";
import { AlertTriangle } from "lucide-react";
import type { ChatMessage } from "@/lib/hospital-tools";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isEmergency = message.tool === "emergency" && !isUser;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[85%] ${
          isUser
            ? "chat-bubble-user"
            : isEmergency
            ? "emergency-alert"
            : "chat-bubble-assistant"
        }`}
      >
        {isEmergency && !isUser && (
          <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
            <AlertTriangle className="h-4 w-4 animate-pulse-emergency" />
            EMERGENCY RESPONSE
          </div>
        )}
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-card-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <p className={`text-[10px] mt-2 ${isUser ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
