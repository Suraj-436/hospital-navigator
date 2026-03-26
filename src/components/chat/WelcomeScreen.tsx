import { Activity, Stethoscope, MapPin, CalendarPlus, AlertTriangle, FileText } from "lucide-react";
import type { ToolType } from "@/lib/hospital-tools";

interface WelcomeScreenProps {
  onToolSelect: (tool: ToolType) => void;
}

const quickActions: { tool: ToolType; icon: React.FC<{ className?: string }>; label: string; desc: string }[] = [
  { tool: "symptom_checker", icon: Stethoscope, label: "Check Symptoms", desc: "Guided assessment" },
  { tool: "nearby_hospitals", icon: MapPin, label: "Find Hospital", desc: "Nearby facilities" },
  { tool: "appointment", icon: CalendarPlus, label: "Book Appointment", desc: "Schedule a visit" },
  { tool: "emergency", icon: AlertTriangle, label: "Emergency", desc: "Urgent help" },
  { tool: "medical_records", icon: FileText, label: "My Records", desc: "Health history" },
];

export function WelcomeScreen({ onToolSelect }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 animate-fade-in-up">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <Activity className="h-7 w-7 text-primary" />
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-1.5">
        How can we assist you today?
      </h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-md text-center">
        Select a service below or describe your medical concern in the chat.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg">
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          const isEmergency = action.tool === "emergency";
          return (
            <button
              key={action.tool}
              onClick={() => onToolSelect(action.tool)}
              className={`tool-result-card flex flex-col items-center gap-2 py-5 px-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up ${
                isEmergency ? "hover:border-emergency/30" : "hover:border-primary/30"
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  isEmergency ? "bg-emergency/10" : "bg-primary/8"
                }`}
              >
                <Icon className={`h-5 w-5 ${isEmergency ? "text-emergency" : "text-primary"}`} />
              </div>
              <div className="text-center">
                <p className={`text-[13px] font-medium ${isEmergency ? "text-emergency" : "text-foreground"}`}>
                  {action.label}
                </p>
                <p className="text-[11px] text-muted-foreground">{action.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground mt-8 max-w-xs text-center leading-relaxed">
        This system provides guidance only and does not constitute medical advice.
        Always consult a qualified healthcare professional.
      </p>
    </div>
  );
}
