import ReactMarkdown from "react-markdown";
import { AlertTriangle, Activity, User, Stethoscope, MapPin, CalendarPlus, FileText, Sparkles } from "lucide-react";
import type { ChatMessage, ToolType } from "@/lib/hospital-tools";

interface MessageBubbleProps {
  message: ChatMessage;
}

const toolBadges: Record<ToolType, { label: string; icon: React.FC<{ className?: string }>; className: string }> = {
  symptom_checker: { label: "Symptom Checker", icon: Stethoscope, className: "bg-primary/10 text-primary" },
  nearby_hospitals: { label: "Nearby Hospitals", icon: MapPin, className: "bg-accent/10 text-accent" },
  appointment: { label: "Appointment", icon: CalendarPlus, className: "bg-info/10 text-info" },
  emergency: { label: "Emergency Mode", icon: AlertTriangle, className: "bg-emergency/10 text-emergency" },
  medical_records: { label: "Medical Records", icon: FileText, className: "bg-muted text-muted-foreground" },
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isEmergency = message.tool === "emergency" && !isUser;
  const badge = !isUser && message.tool ? toolBadges[message.tool] : null;

  return (
    <div className={`flex gap-3 animate-fade-in-up ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
          isUser ? "bg-primary" : isEmergency ? "bg-emergency/15" : "bg-primary/10"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : isEmergency ? (
          <AlertTriangle className="h-4 w-4 text-emergency animate-pulse-emergency" />
        ) : (
          <Activity className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Content */}
      <div className={`max-w-[80%] ${isUser ? "chat-bubble-user" : isEmergency ? "emergency-alert" : "chat-bubble-assistant"}`}>
        {/* Auto-detected tool badge */}
        {badge && !isEmergency && (
          <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3 ${badge.className}`}>
            <Sparkles className="h-3 w-3" />
            {badge.label} Activated
          </div>
        )}

        {isEmergency && (
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="h-3.5 w-3.5" />
            Emergency Response
          </div>
        )}

        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-headings:mb-2 prose-p:text-card-foreground prose-strong:text-foreground prose-a:text-primary prose-li:text-card-foreground prose-ul:my-2 prose-ol:my-2">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        <p
          className={`text-[10px] mt-2.5 ${
            isUser ? "text-primary-foreground/50" : isEmergency ? "opacity-50" : "text-muted-foreground"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
