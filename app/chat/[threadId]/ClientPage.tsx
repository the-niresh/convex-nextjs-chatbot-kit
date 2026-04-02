"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatNotFound } from "@/components/dashboard/ChatNotFound";
import { Loader } from "@/components/ai-elements/loader";
import { Id } from "@/convex/_generated/dataModel";
import ConversationComponent from "@/components/dashboard/ConversationComponent";
import { useThreadMetadata } from "@/hooks/useThreadMetadata";

export default function ChatThreadPage() {
  const params = useParams();
  const threadId = params?.threadId as Id<"threads">;

  const messages = useQuery(
    api.messages.listMessages,
    threadId ? { thread_id: threadId } : "skip"
  );

  useThreadMetadata(threadId);

  const threadExists = useQuery(
    api.threads.checkThreadExists,
    threadId ? { thread_id: threadId } : "skip"
  );

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      document
        .getElementById("messages-end")
        ?.scrollIntoView({ behavior });
    },
    []
  );

  const drivenIds = useMemo(() => {
    const ids = new Set<string>();
    if (!messages) return ids;
    messages.forEach((msg) => {
      if (msg.role === "assistant" && msg.responseStreamId && msg.text === "") {
        ids.add(msg._id);
      }
    });
    return ids;
  }, [messages]);

  const isStreaming = drivenIds.size > 0;

  const handleStreamingComplete = useCallback(() => {}, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("streamingStatusChange", {
        detail: { isStreaming, threadId },
      })
    );
  }, [isStreaming, threadId]);

  if (threadId && threadExists === undefined) return <Loader />;
  if (threadExists === false) return <ChatNotFound />;

  return (
    <>
      <ConversationComponent
        threadId={threadId}
        drivenIds={drivenIds}
        isStreaming={isStreaming}
        onStreamingComplete={handleStreamingComplete}
        scrollToBottom={scrollToBottom}
      />
      <div id="messages-end" />
    </>
  );
}
