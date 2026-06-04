import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Search, Sparkles, Copy, Square, Pencil, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { streamAI } from "@/lib/ai-stream";

export const Route = createFileRoute("/_app/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Worksmart AI" },
      { name: "description", content: "Generate structured research briefs on any workplace topic." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("Team");
  const [depth, setDepth] = useState("Standard");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a research topic.");
      return;
    }
    const prompt = `Create a structured research brief on this topic:
"${topic}"

Target audience: ${audience}
Depth: ${depth}

Use the required markdown section structure.`;
    setOutput("");
    setLoading(true);
    setEditMode(false);
    abortRef.current = new AbortController();
    await streamAI({
      mode: "research",
      prompt,
      onDelta: (c) => setOutput((p) => p + c),
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

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Research Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Get a structured brief with summary, key points, and next steps.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic or question</Label>
            <Textarea
              id="topic"
              rows={4}
              placeholder="e.g. Best practices for onboarding remote engineers in 2025"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Audience</Label>
            <Input value={audience} onChange={(e) => setAudience(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Depth</Label>
            <Select value={depth} onValueChange={setDepth}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Quick", "Standard", "Deep dive"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!loading ? (
            <Button onClick={generate} className="w-full gap-2">
              <Sparkles className="h-4 w-4" /> Generate brief
            </Button>
          ) : (
            <Button onClick={stop} variant="secondary" className="w-full gap-2">
              <Square className="h-4 w-4" /> Stop
            </Button>
          )}
          <AiDisclaimer />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <Label>Research brief</Label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditMode((v) => !v)}
                disabled={!output}
                className="gap-1.5"
              >
                {editMode ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                {editMode ? "Preview" : "Edit"}
              </Button>
              <Button size="sm" variant="ghost" onClick={copy} disabled={!output} className="gap-1.5">
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            </div>
          </div>

          {editMode ? (
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="min-h-[480px] flex-1 font-mono text-sm"
            />
          ) : (
            <div className="min-h-[480px] flex-1 overflow-y-auto rounded-lg border border-border bg-background p-4">
              {output ? (
                <div className="prose-chat">
                  <ReactMarkdown>{output}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {loading ? "Researching…" : "Your AI-generated brief will appear here. Switch to Edit mode to refine it."}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
