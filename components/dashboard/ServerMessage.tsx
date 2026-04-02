"use client";

import { StreamId } from "@convex-dev/persistent-text-streaming";
import { useStream } from "@convex-dev/persistent-text-streaming/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { useMemo, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { Loader } from "../ai-elements/loader";

export function ServerMessage({
  message,
  isDriven,
  stopStreaming,
  scrollToBottom,
}: {
  message: Doc<"messages">;
  isDriven: boolean;
  stopStreaming: () => void;
  scrollToBottom: () => void;
}) {
  const convexSiteUrl =
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ||
    process.env.NEXT_PUBLIC_CONVEX_URL?.replace(/\.cloud$/, ".site") ||
    "";

  const baseUrl = useMemo(() => {
    if (!convexSiteUrl) return null;
    return /^https?:\/\//.test(convexSiteUrl)
      ? convexSiteUrl
      : `https://${convexSiteUrl}`;
  }, [convexSiteUrl]);

  const patchAssistantText = useMutation(api.messages.patchAssistantTextClient);

  const shouldStream =
    Boolean(message.responseStreamId) && isDriven && Boolean(baseUrl);

  const streamUrl = useMemo(() => {
    try {
      const url = new URL(`${baseUrl ?? "https://example.com"}/chat-stream`);
      url.searchParams.append("message_id", message._id);
      if (message.threadId) {
        url.searchParams.append("thread_id", message.threadId);
      }
      return url;
    } catch {
      const url = new URL("https://example.com/chat-stream");
      url.searchParams.append("message_id", message._id);
      return url;
    }
  }, [baseUrl, message._id, message.threadId]);

  const { text, status } = useStream(
    api.streaming.getStreamBody,
    new URL(streamUrl.toString()),
    shouldStream,
    message.responseStreamId as StreamId
  );

  const isCurrentlyStreaming = useMemo(
    () => shouldStream && (status === "pending" || status === "streaming"),
    [shouldStream, status]
  );

  const hasCalledStopStreamingRef = useRef(false);

  useEffect(() => {
    if (!shouldStream) return;

    if (!isCurrentlyStreaming && status !== "pending") {
      if (status === "done" && text && message.text === "") {
        patchAssistantText({ id: message._id, text });
      }
      if (status === "done" && !hasCalledStopStreamingRef.current) {
        hasCalledStopStreamingRef.current = true;
        stopStreaming();
      }
    }
  }, [
    shouldStream,
    isCurrentlyStreaming,
    status,
    text,
    message.text,
    message._id,
    patchAssistantText,
    stopStreaming,
  ]);

  useEffect(() => {
    if (text) scrollToBottom();
  }, [text, scrollToBottom]);

  if (!baseUrl) {
    return (
      <span className="text-destructive text-sm">
        Missing NEXT_PUBLIC_CONVEX_SITE_URL
      </span>
    );
  }

  return text || message.text || <Loader />;
}
