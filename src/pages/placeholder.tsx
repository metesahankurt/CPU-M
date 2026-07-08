import { Construction } from "lucide-react";

/** Temporary stand-in while category pages are being built out. */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
      <Construction className="size-8" />
      <p className="text-sm">{title}</p>
    </div>
  );
}
