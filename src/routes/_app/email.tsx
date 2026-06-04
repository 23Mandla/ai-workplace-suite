import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Mail, Sparkles, Copy, Square } from "lucide-react";
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

export const Route = createFileRoute("/_app/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Worksmart AI" },
      { name: "description", content: "Generate professional workplace emails with AI." },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [intent, setIntent] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    if (!intent.trim()) {
      toast.error("Please describe what the email is about.");
      return;
    }
    const prompt = `Write an email with the following details:
- Recipient / audience: ${recipient || "Unspecified"}
- Tone: ${tone}
- Length: ${length}
- Purpose / key points: ${intent}

Return the email starting with "Subject:" on the first line.`;

    setOutput("");
    setLoading(true);
    abortRef.current = new AbortController();
    await streamAI({
      mode: "email",
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
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Smart Email Generator</h1>
          <p className="text-sm text-muted-foreground">
            Draft polished emails by specifying audience, tone, and intent.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient / audience</Label>
            <Input
              id="recipient"
              placeholder="e.g. My manager, a new client, the team"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Professional", "Friendly", "Formal", "Persuasive", "Apologetic", "Concise"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Short", "Medium", "Long"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="intent">What is the email about?</Label>
            <Textarea
              id="intent"
              rows={6}
              placeholder="e.g. Request a one-week extension on the Q3 report, briefly explain the cause, propose a new deadline."
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {!loading ? (
              <Button onClick={generate} className="gap-2">
                <Sparkles className="h-4 w-4" /> Generate email
              </Button>
            ) : (
              <Button onClick={stop} variant="secondary" className="gap-2">
                <Square className="h-4 w-4" /> Stop
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <Label htmlFor="output">Editable draft</Label>
            <Button size="sm" variant="ghost" onClick={copy} disabled={!output} className="gap-1.5">
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
          <Textarea
            id="output"
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder={loading ? "Generating…" : "Your AI-generated email will appear here. You can edit it freely."}
            className="min-h-[360px] flex-1 font-mono text-sm leading-relaxed"
          />
          <AiDisclaimer />
        </div>
      </div>
    </div>
  );
}
