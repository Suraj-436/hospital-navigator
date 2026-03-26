import { useState, FormEvent, useRef } from "react";
import { Send, Plus, X } from "lucide-react";
import type { ToolType } from "@/lib/hospital-tools";
import { ToolMenu } from "./ToolMenu";

interface ChatInputProps {
  onSend: (message: string, tool?: ToolType) => void;
  isLoading: boolean;
}

const toolLabels: Record<ToolType, string> = {
  symptom_checker: "Symptom Checker",
  nearby_hospitals: "Nearby Hospitals",
  appointment: "Appointment",
  emergency: "Emergency",
  medical_records: "Medical Records",
};

const toolPrompts: Record<ToolType, string> = {
  symptom_checker: "I'd like to check my symptoms.",
  nearby_hospitals: "Help me find nearby hospitals.",
  appointment: "I need to schedule an appointment.",
  emergency: "I need emergency assistance.",
  medical_records: "I'd like to access my medical records.",
};

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
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleToolSelect = (tool: ToolType) => {
    setActiveTool(tool);
    setShowTools(false);
    setInput(toolPrompts[tool]);
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 pb-4">
      {activeTool && (
        <div className="flex items-center gap-2 mb-2 animate-fade-in-up">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              activeTool === "emergency"
                ? "bg-emergency/10 text-emergency"
                : "bg-primary/10 text-primary"
            }`}
          >
            {toolLabels[activeTool]}
          </span>
          <button
            onClick={() => setActiveTool(undefined)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 bg-card border border-border rounded-2xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-primary/40 transition-all duration-200"
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTools(!showTools)}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/8 transition-all duration-200"
          >
            <Plus className={`h-5 w-5 transition-transform duration-200 ${showTools ? "rotate-45" : ""}`} />
          </button>
          {showTools && (
            <ToolMenu onSelect={handleToolSelect} onClose={() => setShowTools(false)} />
          )}
        </div>

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
          className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none min-h-[36px] max-h-[140px] py-2"
          rows={1}
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-all duration-200 shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <p className="text-[10px] text-muted-foreground text-center mt-2">
        MedAssist provides guidance only — not a substitute for professional medical advice
      </p>
    </div>
  );
}
