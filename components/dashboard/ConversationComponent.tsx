"use client";

import { Fragment, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Loader } from "@/components/ai-elements/loader";
import { Check, CopyIcon } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Action, Actions } from "@/components/ai-elements/actions";
import { Response } from "@/components/ai-elements/response";
import dynamic from "next/dynamic";

const ServerMessage = dynamic(
  () => import("./ServerMessage").then((mod) => mod.ServerMessage),
  { ssr: false }
);

interface ConversationComponentProps {
  threadId: Id<"threads">;
  drivenIds: Set<string>;
  isStreaming: boolean;
  onStreamingComplete: () => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

export default function ConversationComponent({
  threadId,
  drivenIds,
  isStreaming,
  onStreamingComplete,
  scrollToBottom,
}: ConversationComponentProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const copyText = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  };

  const messages = useQuery(
    api.messages.listMessages,
    threadId ? { thread_id: threadId } : "skip"
  );

  useEffect(() => {
    if (messages) scrollToBottom();
  }, [messages, scrollToBottom]);

  if (!messages)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader size={24} />
      </div>
    );

  return (
    <Conversation className="overflow-y-auto overscroll-none">
      <ConversationContent>
        {messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <Fragment key={message._id}>
                <Message from={message.role}>
                  <MessageContent>
                    {message.role === "assistant" &&
                    message.responseStreamId &&
                    message.text === "" ? (
                      <ServerMessage
                        message={message}
                        isDriven={drivenIds.has(message._id)}
                        stopStreaming={() => onStreamingComplete()}
                        scrollToBottom={scrollToBottom}
                      />
                    ) : (
                      <Response
                        className={
                          message.role === "assistant" &&
                          isStreaming &&
                          drivenIds.size === 0
                            ? "streaming-cursor"
                            : undefined
                        }
                      >
                        {message.text}
                      </Response>
                    )}
                  </MessageContent>
                </Message>

                {message.role === "assistant" && message.text && (
                  <Actions className="mb-1 ml-1">
                    <Action
                      onClick={async () => {
                        await copyText(message.text);
                        setCopiedMessageId(message._id);
                        window.setTimeout(() => setCopiedMessageId(null), 1200);
                      }}
                      label="Copy"
                    >
                      {copiedMessageId === message._id ? (
                        <Check className="size-3 text-green-500 animate-in zoom-in-95 duration-150" />
                      ) : (
                        <CopyIcon className="size-3" />
                      )}
                    </Action>
                  </Actions>
                )}
              </Fragment>
            ))}
          </>
        ) : (
          <div className="flex h-full items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <CopyIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h2 className="mb-1 text-base font-semibold">
                Start a conversation
              </h2>
              <p className="text-sm text-muted-foreground">
                Type a message below to begin.
              </p>
            </div>
          </div>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
