import { AlertTriangle } from "lucide-react";

export function AiDisclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p>
        AI-generated content may be inaccurate or incomplete. Always review and
        edit outputs before sharing or acting on them. Do not include
        confidential or personal data in prompts.
      </p>
    </div>
  );
}
