import {
  MessageSquarePlus,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Activity,
  MessageCircle,
} from "lucide-react";
import type { Conversation } from "@/hooks/use-chat";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onToggle,
}: ChatSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-40 h-full sidebar-dark flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0"
        }`}
      >
        <div className={`flex flex-col h-full w-72 ${isOpen ? "opacity-100" : "opacity-0 lg:opacity-0"} transition-opacity duration-200`}>
          {/* Logo */}
          <div className="flex items-center justify-between px-4 h-16 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm" style={{ color: "hsl(var(--sidebar-accent-text))" }}>
                MedAssist
              </span>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: "hsl(var(--sidebar-muted))" }}
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* New Chat button */}
          <div className="p-3">
            <button
              onClick={onNew}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border"
              style={{
                borderColor: "hsl(var(--sidebar-border))",
                color: "hsl(var(--sidebar-accent-text))",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--sidebar-hover))")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <MessageSquarePlus className="h-4 w-4" />
              New Consultation
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
            {conversations.length === 0 && (
              <p className="text-xs px-3 py-6 text-center" style={{ color: "hsl(var(--sidebar-muted))" }}>
                No consultations yet
              </p>
            )}
            {conversations.map((conv, i) => (
              <div
                key={conv.id}
                className={`group sidebar-item animate-slide-in-left ${
                  conv.id === activeId ? "sidebar-item-active" : ""
                }`}
                style={{ animationDelay: `${i * 30}ms` }}
                onClick={() => onSelect(conv.id)}
              >
                <MessageCircle className="h-4 w-4 shrink-0 opacity-60" />
                <span className="flex-1 truncate text-[13px]">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity"
                  style={{ color: "hsl(var(--sidebar-muted))" }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t text-[11px]" style={{ borderColor: "hsl(var(--sidebar-border))", color: "hsl(var(--sidebar-muted))" }}>
            Hospital guidance only — not medical advice
          </div>
        </div>
      </aside>

      {/* Collapsed toggle button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-20 p-2 rounded-lg bg-card border border-border shadow-sm hover:bg-muted transition-colors"
        >
          <PanelLeft className="h-5 w-5 text-muted-foreground" />
        </button>
      )}
    </>
  );
}
