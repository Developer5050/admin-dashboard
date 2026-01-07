import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md",
        "bg-muted/90 dark:bg-muted/70",
        "border border-border/30",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
