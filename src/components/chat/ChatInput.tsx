import { useState, useRef, FormEvent } from "react";
import { Send, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolType } from "@/lib/hospital-tools";
import { ToolMenu } from "./ToolMenu";

interface ChatInputProps {
  onSend: (message: string, tool?: ToolType) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showTools, setShowTools] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType | undefined>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim(), activeTool);
    setInput("");
    setActiveTool(undefined);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleToolSelect = (tool: ToolType) => {
    setActiveTool(tool);
    setShowTools(false);
    const prompts: Record<ToolType, string> = {
      symptom_checker: "I'd like to check my symptoms.",
      nearby_hospitals: "Help me find nearby hospitals.",
      appointment: "I need to schedule an appointment.",
      emergency: "I need emergency assistance.",
      medical_records: "I'd like to access my medical records.",
    };
    setInput(prompts[tool]);
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const toolLabels: Record<ToolType, string> = {
    symptom_checker: "Symptom Checker",
    nearby_hospitals: "Nearby Hospitals",
    appointment: "Appointment",
    emergency: "Emergency",
    medical_records: "Medical Records",
  };

  return (
    <div className="relative">
      {showTools && (
        <ToolMenu
          onSelect={handleToolSelect}
          onClose={() => setShowTools(false)}
        />
      )}

      {activeTool && (
        <div className="flex items-center gap-2 px-4 pt-2">
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
            {toolLabels[activeTool]}
          </span>
          <button
            onClick={() => setActiveTool(undefined)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={() => setShowTools(!showTools)}
        >
          <Plus className="h-5 w-5" />
        </Button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Describe your symptoms or ask a question..."
          className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[42px] max-h-[120px]"
          rows={1}
          disabled={isLoading}
        />

        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="shrink-0 h-10 w-10 rounded-full"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
