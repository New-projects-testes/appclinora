import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-14 ${className}`}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl rounded-full" />
        <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/15 border border-primary/10 flex items-center justify-center">
          <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="font-display text-lg text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
