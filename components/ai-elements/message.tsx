import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import type { ComponentProps, HTMLAttributes } from "react";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "message-animate group flex w-full items-end justify-end gap-2 py-3",
      from === "user"
        ? "user"
        : "assistant flex-row-reverse justify-end",
      "[&>div]:max-w-[90%]",
      className
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "flex flex-col gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm leading-relaxed",
      "group-[.user]:bg-muted group-[.user]:text-foreground",
      "group-[.assistant]:bg-transparent group-[.assistant]:text-foreground group-[.assistant]:px-0",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar className={cn("size-7 ring-1 ring-border", className)} {...props}>
    <AvatarImage alt="" src={src} />
    <AvatarFallback className="text-xs">
      {name?.slice(0, 2) || "ME"}
    </AvatarFallback>
  </Avatar>
);
