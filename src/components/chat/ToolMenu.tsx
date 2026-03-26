import { Stethoscope, MapPin, CalendarPlus, AlertTriangle, FileText } from "lucide-react";
import { TOOLS, ToolType } from "@/lib/hospital-tools";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Stethoscope,
  MapPin,
  CalendarPlus,
  AlertTriangle,
  FileText,
};

interface ToolMenuProps {
  onSelect: (tool: ToolType) => void;
  onClose: () => void;
}

export function ToolMenu({ onSelect, onClose }: ToolMenuProps) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute bottom-full left-0 mb-2 z-20 bg-card border border-border rounded-2xl shadow-xl p-2 w-[300px] animate-slide-up">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 pt-2 pb-1.5">
          Hospital Tools
        </p>
        <div className="space-y-0.5">
          {TOOLS.map((tool, i) => {
            const Icon = iconMap[tool.icon];
            const isEmergency = tool.id === "emergency";
            return (
              <button
                key={tool.id}
                onClick={() => onSelect(tool.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left animate-fade-in-up ${
                  isEmergency
                    ? "hover:bg-emergency/8"
                    : "hover:bg-muted"
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isEmergency ? "bg-emergency/10" : "bg-primary/8"
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`h-[18px] w-[18px] ${
                        isEmergency ? "text-emergency" : tool.color
                      }`}
                    />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isEmergency ? "text-emergency" : "text-foreground"}`}>
                    {tool.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
