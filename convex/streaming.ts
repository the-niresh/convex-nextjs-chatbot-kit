import {
  PersistentTextStreaming,
  StreamId,
  StreamIdValidator,
} from "@convex-dev/persistent-text-streaming";
import { components } from "./_generated/api";
import { httpAction, query } from "./_generated/server";
import { OpenAI } from "openai";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const streamingComponent = new PersistentTextStreaming(
  components.persistentTextStreaming
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT =
  process.env.SYSTEM_PROMPT ??
  "You are a helpful, knowledgeable assistant. Answer clearly and concisely.";

export const getStreamBody = query({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, args) => {
    return await streamingComponent.getStreamBody(
      ctx,
      args.streamId as StreamId
    );
  },
});

export const chatStream = httpAction(async (ctx, request) => {
  // Auth check: Convex auth token is forwarded automatically by useStream
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const messageId = url.searchParams.get("message_id") ?? "";
  if (!messageId) {
    return new Response("Missing message_id", { status: 400 });
  }

  const body = (await request.json()) as { streamId?: string };
  const streamId = body.streamId ?? "";
  if (!streamId) {
    return new Response("Missing streamId", { status: 400 });
  }

  const assistantMessage = await ctx.runQuery(api.messages.getMessage, {
    id: messageId as Id<"messages">,
  });
  if (!assistantMessage) {
    return new Response("Message not found", { status: 404 });
  }

  const threadId = assistantMessage.threadId;
  if (!threadId) {
    return new Response("Message missing threadId", { status: 400 });
  }

  const threadMessages = await ctx.runQuery(api.messages.listMessages, {
    thread_id: threadId,
  });

  const openAiMessages = threadMessages
    .filter((m) => m.text !== "")
    .map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.text,
    }));

  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "*";

  const response = await streamingComponent.stream(
    ctx,
    request,
    streamId as StreamId,
    async (_ctx, _request, _streamId, chunkAppender) => {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...openAiMessages,
        ],
      });

      for await (const part of completion) {
        const delta = part.choices?.[0]?.delta?.content;
        if (!delta) continue;
        await chunkAppender(delta);
      }
    }
  );

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Vary", "Origin");
  return response;
});
