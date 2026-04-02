"use client";

import * as React from "react";
import { MessageSquare } from "lucide-react";
import { NavHistories } from "@/components/dashboard/ui/nav-histories";
import { NavUser } from "@/components/dashboard/ui/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";

export interface DashBoardSidebarProps
  extends React.ComponentProps<typeof Sidebar> {
  externalUser?: {
    _id?: Id<"users">;
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  };
  activeThreadId?: Id<"threads">;
}

function SidebarSkeleton() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="space-y-6 p-2">
          <div className="space-y-1">
            <div className="px-2 py-1">
              <Skeleton className="h-4 w-16 mb-3" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 p-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function DashBoardSidebar({
  externalUser,
  activeThreadId,
  ...props
}: DashBoardSidebarProps) {
  const activeUrl = activeThreadId ? `/chat/${activeThreadId}` : undefined;
  const localUser = useQuery(
    api.users.getCurrentUser,
    externalUser ? "skip" : undefined
  );
  const user = externalUser || localUser;

  const userThreads = useQuery(api.threads.listThreadsByUser);

  const histories = React.useMemo(() => {
    if (!userThreads || userThreads.length === 0) return [];

    return userThreads.map((thread) => ({
      name: thread.title || "Untitled",
      url: `/chat/${thread._id}`,
      icon: MessageSquare,
    }));
  }, [userThreads]);

  if (!user) return <SidebarSkeleton />;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        <NavHistories histories={histories} activeUrl={activeUrl} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "User",
            email: user?.email ?? "user@example.com",
            avatar: user?.avatar_url ?? "/avatars/shadcn.jpg",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
