import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ClientPage from "./ClientPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ threadId: string }>;
}): Promise<Metadata> {
  const { threadId } = await params;
  const token = await convexAuthNextjsToken();
  const thread = await fetchQuery(
    api.threads.get,
    { id: threadId as Id<"threads"> },
    { token }
  );

  return {
    title: thread?.title || "Chat | Convex Chatbot Kit",
    description: `Chat thread: ${thread?.title || "View this thread"}`,
    openGraph: {
      title: thread?.title || "Chat",
      description: `Chat thread: ${thread?.title || "View this thread"}`,
    },
  };
}

export default function ThreadPage() {
  return <ClientPage />;
}