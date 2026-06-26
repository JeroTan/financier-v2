import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type MarkdownTextProps = {
  children: string;
  className?: string;
};

const markdownComponents: Components = {
  p: ({ className, ...props }) => (
    <p className={cn("mb-3 last:mb-0", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("my-3 list-disc space-y-1 pl-5 first:mt-0 last:mb-0", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("my-3 list-decimal space-y-1 pl-5 first:mt-0 last:mb-0", className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("pl-1", className)} {...props} />
  ),
  a: ({ className, href, ...props }) => (
    <a
      className={cn("font-semibold text-current underline underline-offset-2", className)}
      href={href}
      rel={href?.startsWith("#") ? undefined : "noreferrer"}
      target={href?.startsWith("#") ? undefined : "_blank"}
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-semibold", className)} {...props} />
  ),
  em: ({ className, ...props }) => (
    <em className={cn("italic", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote className={cn("my-3 border-l-2 border-chat-border pl-3 text-muted-foreground first:mt-0 last:mb-0", className)} {...props} />
  ),
  code: ({ className, ...props }) => (
    <code className={cn("rounded bg-background px-1 py-0.5 font-mono text-[0.85em]", className)} {...props} />
  ),
  pre: ({ className, ...props }) => (
    <pre className={cn("my-3 overflow-x-auto rounded-md bg-background p-3 text-xs first:mt-0 last:mb-0", className)} {...props} />
  ),
};

export function MarkdownText({ children, className }: MarkdownTextProps) {
  return (
    <div className={cn("markdown-text", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
