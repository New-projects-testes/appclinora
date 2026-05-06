import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-success/80 text-white",
  "bg-warning text-warning-foreground",
  "bg-secondary text-secondary-foreground",
  "bg-[oklch(0.55_0.15_280)] text-white",
  "bg-[oklch(0.6_0.15_180)] text-white",
  "bg-[oklch(0.6_0.18_30)] text-white",
  "bg-[oklch(0.55_0.15_330)] text-white",
];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

export function PatientAvatar({
  name,
  src,
  size = 36,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };

  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={style}
        className={cn("rounded-full object-cover shrink-0", className)}
      />
    );
  }

  const color = PALETTE[hash(name) % PALETTE.length];
  return (
    <div
      style={style}
      className={cn(
        "rounded-full flex items-center justify-center font-semibold shrink-0",
        color,
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
