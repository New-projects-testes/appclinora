import { CheckCircle2 } from "lucide-react";

export function VerifiedBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-success/15 text-success font-medium ${
        size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]"
      }`}
      title="Profissional verificado"
    >
      <CheckCircle2 className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} />
      Verificado
    </span>
  );
}
