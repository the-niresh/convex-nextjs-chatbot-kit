import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { streamingComponent } from "./streaming";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

export const listMessages = query({
  args: { thread_id: v.optional(v.id("threads")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    if (args.thread_id) {
      // Verify thread ownership before returning messages
      const thread = await ctx.db.get(args.thread_id);
      if (!thread || thread.userId !== userId) throw new Error("Unauthorized");

      return await ctx.db
        .query("messages")
        .withIndex("by_thread_id", (q) => q.eq("threadId", args.thread_id))
        .order("asc")
        .collect();
    }

    return [];
  },
});

export const getMessage = query({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const message = await ctx.db.get(args.id);
    if (!message) return null;

    if (message.threadId) {
      const thread = await ctx.db.get(message.threadId);
      if (!thread || thread.userId !== userId) throw new Error("Unauthorized");
    }

    return message;
  },
});

export const patchAssistantText = internalMutation({
  args: {
    id: v.id("messages"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { text: args.text });
  },
});

export const sendMessage = mutation({
  args: {
    text: v.string(),
    thread_id: v.optional(v.id("threads")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    let threadId = args.thread_id;

    if (threadId) {
      const thread = await ctx.db.get(threadId);
      if (!thread || thread.userId !== userId) throw new Error("Unauthorized");
      await ctx.db.patch(threadId, { updated_at: Date.now() });
    } else {
      threadId = await ctx.db.insert("threads", {
        userId,
        title: "New Conversation",
        messages: [],
        created_at: Date.now(),
        updated_at: Date.now(),
      });
    }

    const userMessageId = await ctx.db.insert("messages", {
      threadId,
      role: "user",
      text: args.text,
    });

    const thread = await ctx.db.get(threadId);
    if (thread) {
      await ctx.db.patch(threadId, {
        messages: [...thread.messages, userMessageId],
      });
    }

    const responseStreamId = await streamingComponent.createStream(ctx);
    const assistantId = await ctx.db.insert("messages", {
      threadId,
      role: "assistant",
      text: "",
      responseStreamId,
    });

    const updatedThread = await ctx.db.get(threadId);
    if (updatedThread) {
      await ctx.db.patch(threadId, {
        messages: [...updatedThread.messages, assistantId],
      });
    }

    if (thread && (thread.title === "New Conversation" || !thread.title)) {
      await ctx.db.patch(threadId, {
        title: `Chat — ${args.text.slice(0, 40)}`,
      });
      await ctx.scheduler.runAfter(0, api.threads.generateThreadTitle, {
        text: args.text,
        threadId,
      });
    }

    return { assistantId, threadId };
  },
});

export const patchAssistantTextClient = mutation({
  args: {
    id: v.id("messages"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const message = await ctx.db.get(args.id);
    if (!message) throw new Error("Message not found");

    if (message.threadId) {
      const thread = await ctx.db.get(message.threadId);
      if (!thread || thread.userId !== userId) throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, { text: args.text });
  },
});
