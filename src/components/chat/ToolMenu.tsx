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
      <div className="absolute bottom-full left-3 mb-2 z-20 bg-card border border-border rounded-xl shadow-lg p-2 w-72 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
          Hospital Tools
        </p>
        {TOOLS.map((tool) => {
          const Icon = iconMap[tool.icon];
          return (
            <button
              key={tool.id}
              onClick={() => onSelect(tool.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
            >
              {Icon && <Icon className={`h-5 w-5 ${tool.color} shrink-0`} />}
              <div>
                <p className="text-sm font-medium text-foreground">{tool.label}</p>
                <p className="text-xs text-muted-foreground">{tool.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
