import { supabase } from "@/integrations/supabase/client";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`;

export type ChatMsg = { role: "user" | "assistant"; content: string };

export interface StreamOptions {
  mode: "email" | "research" | "chat";
  messages?: ChatMsg[];
  prompt?: string;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError?: (err: { status?: number; message: string }) => void;
  signal?: AbortSignal;
}

export async function streamAI({
  mode,
  messages,
  prompt,
  onDelta,
  onDone,
  onError,
  signal,
}: StreamOptions) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token =
      sessionData.session?.access_token ??
      (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string);

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
      },
      body: JSON.stringify({ mode, messages, prompt }),
      signal,
    });

    if (!resp.ok || !resp.body) {
      let msg = "Failed to start AI stream";
      try {
        const j = await resp.json();
        if (j?.error) msg = j.error;
      } catch {}
      onError?.({ status: resp.status, message: msg });
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let done = false;

    while (!done) {
      const r = await reader.read();
      if (r.done) break;
      buffer += decoder.decode(r.value, { stream: true });

      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line || line.startsWith(":")) continue;
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") {
          done = true;
          break;
        }
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    onDone();
  } catch (e) {
    if ((e as Error).name === "AbortError") return;
    onError?.({ message: e instanceof Error ? e.message : "Unknown error" });
  }
}
