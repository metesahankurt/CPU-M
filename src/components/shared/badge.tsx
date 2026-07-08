import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "muted" | "warning" | "success" | "destructive";
  className?: string;
  children: React.ReactNode;
}

const variantClasses = {
  muted: "bg-muted text-muted-foreground",
  warning:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  success:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  destructive: "bg-destructive/10 text-destructive",
} as const;

export function Badge({ variant = "muted", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium text-xs",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
