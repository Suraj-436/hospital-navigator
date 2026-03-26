export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in-up">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
        <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
      <div className="chat-bubble-assistant">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
          <span className="text-xs text-muted-foreground">Analyzing your query...</span>
        </div>
      </div>
    </div>
  );
}
