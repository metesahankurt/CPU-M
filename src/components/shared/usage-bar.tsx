import { cn } from "@/lib/utils";

interface UsageBarProps {
  /** 0..100 */
  percent: number;
  className?: string;
}

export function UsageBar({ percent, className }: UsageBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500",
          clamped > 90
            ? "bg-destructive"
            : clamped > 70
              ? "bg-amber-500"
              : "bg-primary",
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
