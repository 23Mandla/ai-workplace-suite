import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { MessageSquare, Send, Square, Pencil, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { streamAI, type ChatMsg } from "@/lib/ai-stream";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Worksmart AI" },
      { name: "description", content: "Conversational AI assistant for workplace tasks." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: ChatMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    let acc = "";
    abortRef.current = new AbortController();
    await streamAI({
      mode: "chat",
      messages: next,
      onDelta: (c) => {
        acc += c;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m));
          }
          return [...prev, { role: "assistant", content: acc }];
        });
      },
      onDone: () => setLoading(false),
      onError: (e) => {
        setLoading(false);
        toast.error(e.message);
      },
      signal: abortRef.current.signal,
    });
  };

  const stop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const startEdit = (i: number) => {
    setEditIdx(i);
    setEditValue(messages[i].content);
  };
  const saveEdit = () => {
    if (editIdx === null) return;
    setMessages((prev) => prev.map((m, i) => (i === editIdx ? { ...m, content: editValue } : m)));
    setEditIdx(null);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-col px-4 py-6 md:px-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">AI Chatbot</h1>
            <p className="text-sm text-muted-foreground">
              Ask anything — brainstorm, summarize, plan.
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="gap-1.5">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 opacity-40" />
            <p className="text-sm">Start a conversation. Try: "Summarize this meeting note…"</p>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "group flex flex-col gap-1",
                m.role === "user" ? "items-end" : "items-start",
              )}
            >
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {m.role === "user" ? "You" : "Assistant"}
              </div>
              {editIdx === i ? (
                <div className="w-full max-w-[85%] space-y-2">
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditIdx(null)} className="gap-1">
                      <X className="h-3.5 w-3.5" /> Cancel
                    </Button>
                    <Button size="sm" onClick={saveEdit} className="gap-1">
                      <Check className="h-3.5 w-3.5" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="prose-chat">
                      <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              )}
              {editIdx !== i && (
                <button
                  onClick={() => startEdit(i)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-foreground"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Message the assistant…  (Shift+Enter for new line)"
            rows={2}
            className="resize-none"
          />
          {loading ? (
            <Button onClick={stop} variant="secondary" className="h-auto gap-1.5">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={send} disabled={!input.trim()} className="h-auto gap-1.5">
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
        <AiDisclaimer />
      </div>
    </div>
  );
}
