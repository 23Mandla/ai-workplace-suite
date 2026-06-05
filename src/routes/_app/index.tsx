import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Search, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { AiDisclaimer } from "@/components/AiDisclaimer";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Worksmart AI" },
      { name: "description", content: "AI tools to automate workplace tasks: email drafting, research, and a chatbot assistant." },
    ],
  }),
  component: Dashboard,
});

//tools data - in a real app, this might come from an API or config file
const tools = [
  {
    to: "/email",
    title: "Smart Email Generator",
    desc: "Draft professional emails in seconds. Set tone, audience, and intent.",
    icon: Mail,
  },
  {
    to: "/research",
    title: "AI Research Assistant",
    desc: "Get structured briefs on any topic with key points and next steps.",
    icon: Search,
  },
  {
    to: "/chat",
    title: "AI Chatbot",
    desc: "Conversational assistant for brainstorming, summaries, and Q&A.",
    icon: MessageSquare,
  },
];

function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Pick a tool to automate your next workplace task.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <t.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold">{t.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <AiDisclaimer />
      </div>
    </div>
  );
}
