import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bot,
  Database,
  Github,
  Lock,
  MessageSquare,
  Zap,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: MessageSquare,
    title: "Persistent Chat Threads",
    description:
      "Full conversation history with auto-generated titles. Users pick up exactly where they left off across sessions and devices.",
  },
  {
    icon: Zap,
    title: "Convex Persistent Streaming",
    description:
      "Tokens stream directly from the LLM into Convex storage. Refresh mid-stream and the response continues — no lost output.",
  },
  {
    icon: Database,
    title: "Real-Time by Default",
    description:
      "Every message, title update, and thread creation propagates instantly across all open tabs via Convex's reactive query system.",
  },
  {
    icon: Lock,
    title: "Email OTP Auth",
    description:
      "Convex Auth with Resend-powered magic links — no passwords. Row-level security ensures users can only access their own threads.",
  },
  {
    icon: Bot,
    title: "Pluggable LLM",
    description:
      "Defaults to GPT-4o-mini with a configurable system prompt via environment variables. Swap any OpenAI-compatible model in seconds.",
  },
  {
    icon: Database,
    title: "Zero Infrastructure",
    description:
      "Convex handles your backend, database, file storage, and serverless functions. Deploy to Vercel and Convex Cloud in under 10 minutes.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
              <Bot className="h-4 w-4 text-background" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              convex-nextjs-chatbot-kit
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/the-niresh/convex-nextjs-chatbot-kit"
              target="_blank"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="View on GitHub"
            >
              <Github className="h-4 w-4" />
            </Link>
            <Link href="/login">
              <Button size="sm" className="h-8 px-4 text-xs rounded-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-28 md:py-40">
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Open Source Template
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
            AI Chatbot Starter
            <br />
            <span className="text-muted-foreground">with Convex + Next.js</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            A production-ready template for building full-stack AI chat
            applications. Persistent streaming, real-time sync, email auth — all
            wired up and ready to customize.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login">
              <Button
                size="lg"
                className="h-11 gap-2 rounded-xl px-6 text-sm font-medium"
              >
                Open the Chat <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="https://github.com/the-niresh/convex-nextjs-chatbot-kit"
              target="_blank"
            >
              <Button
                size="lg"
                variant="outline"
                className="h-11 rounded-xl px-6 text-sm font-medium gap-2"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stack badges */}
      <section className="border-y border-border/50 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              "Next.js 16",
              "Convex",
              "Convex Auth",
              "Persistent Text Streaming",
              "OpenAI API",
              "Tailwind CSS v4",
              "shadcn/ui",
            ].map((tech) => (
              <span
                key={tech}
                className="text-sm font-medium text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              Everything wired up for you
            </h2>
            <p className="text-base text-muted-foreground">
              Not a demo. A real foundation you can build a product on.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-xl border border-border p-6 transition-colors hover:border-foreground/20 hover:bg-muted/40"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <h3 className="mb-2 text-sm font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 py-20">
        <div className="mx-auto max-w-lg px-6 text-center">
          <h2 className="mb-3 text-2xl font-bold tracking-tight">
            Fork it. Ship it.
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Clone the repo, add your OpenAI key and Convex URL, deploy to
            Vercel. Working chatbot in under 10 minutes.
          </p>
          <Link href="/login">
            <Button className="h-10 gap-2 rounded-xl px-6 text-sm">
              Try the demo <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
                <Bot className="h-3.5 w-3.5 text-background" />
              </div>
              <span className="text-xs text-muted-foreground">
                convex-nextjs-chatbot-kit
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              MIT License · Built with{" "}
              <Link
                href="https://convex.dev"
                target="_blank"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Convex
              </Link>{" "}
              &{" "}
              <Link
                href="https://nextjs.org"
                target="_blank"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Next.js
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
