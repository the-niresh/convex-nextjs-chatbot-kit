"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api"; // Adjust path
import { Id } from "../convex/_generated/dataModel";
import { usePathname } from "next/navigation";

export function useThreadMetadata(threadId?: Id<"threads">) {
  const previousTitleRef = useRef<string>(""); // Use ref to avoid dep changes

  // Fetch thread title client-side (lightweight)
  const thread = useQuery(
    api.threads.get,
    threadId ? { id: threadId } : "skip"
  );

  const pathname = usePathname();
  const isThreadRoute = pathname.startsWith("/chat/");

  useEffect(() => {
    // On mount (client-only): Capture current title as previous
    previousTitleRef.current = document.title || "Convex Chatbot Kit";
  }, []);

  const title =
    isThreadRoute && thread
      ? `${thread?.title || "Thread Not Found"} | Convex Chatbot Kit`
      : "Convex Chatbot Kit";

  useEffect(() => {
    if (!isThreadRoute || !thread) {
      const fallbackTitle = previousTitleRef.current || "Convex Chatbot Kit";
      document.title = fallbackTitle;
      return;
    }

    document.title = title;

    // Preserve current as previous for next navigation
    previousTitleRef.current = title;
  }, [isThreadRoute, thread, title]);

  return { title };
}