"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatAgent from "@/components/dashboard/ChatAgent";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DashBoardSidebar } from "@/components/dashboard/DashBoardSidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Github, Plus, SquarePen } from "lucide-react";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const threadId = params?.threadId as Id<"threads"> | undefined;
  const user = useQuery(api.users.getCurrentUser);
  const thread = useQuery(
    api.threads.get,
    threadId ? { id: threadId } : "skip"
  );
  const threadTitle =
    !threadId || !thread?.title || thread.title === "New Conversation"
      ? "New"
      : thread.title;

  const [input, setInput] = useState("");
  const [status, setStatus] = useState<
    "ready" | "streaming" | "submitted" | "error"
  >("ready");

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useMutation(api.messages.sendMessage);
  const createThread = useMutation(api.threads.createThread);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status === "ready") focusInput();
  }, [status, focusInput]);

  useEffect(() => {
    const handleStreamingStatusChange = (event: CustomEvent) => {
      const { isStreaming, threadId: eventThreadId } = event.detail;
      if (threadId && eventThreadId === threadId) {
        setStatus(isStreaming ? "streaming" : "ready");
      }
    };

    window.addEventListener(
      "streamingStatusChange",
      handleStreamingStatusChange as EventListener
    );
    return () => {
      window.removeEventListener(
        "streamingStatusChange",
        handleStreamingStatusChange as EventListener
      );
    };
  }, [threadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    let currentThreadId = threadId ?? null;
    let shouldRedirect = false;

    if (!currentThreadId) {
      currentThreadId = await createThread({});
      shouldRedirect = true;
    }

    setStatus("submitted");

    try {
      await sendMessage({
        text: input,
        thread_id: currentThreadId ?? undefined,
      });

      setStatus("streaming");
      setInput("");
    } catch {
      setStatus("error");
      return;
    }

    if (shouldRedirect && currentThreadId) {
      router.push(`/chat/${currentThreadId}`, { scroll: false });
    }
  };

  return (
    <SidebarProvider>
      <DashBoardSidebar
        externalUser={user ?? undefined}
        activeThreadId={threadId}
      />
      <SidebarInset className="h-screen overflow-hidden flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/chat">Chat</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{threadTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex flex-1 justify-end gap-2 px-4">
            <ModeToggle />
            <Link
              href="https://github.com/the-niresh/convex-nextjs-chatbot-kit"
              target="_blank"
            >
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="hover:bg-accent"
                title="View on GitHub"
              >
                <Github />
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hover:bg-accent"
              onClick={() => router.push("/chat")}
              title="New chat"
            >
              <SquarePen />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <ChatAgent threadId={threadId}>
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto">{children}</div>

              <PromptInput onSubmit={handleSubmit} className="mt-4 pb-4">
                <PromptInputTextarea
                  ref={inputRef}
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  placeholder="Ask anything..."
                />
                <PromptInputToolbar>
                  <PromptInputTools>
                    <PromptInputButton>
                      <Plus size={16} />
                    </PromptInputButton>
                  </PromptInputTools>
                  <PromptInputSubmit
                    disabled={status !== "ready" || !input.trim()}
                    status={status}
                  />
                </PromptInputToolbar>
              </PromptInput>
            </div>
          </ChatAgent>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
